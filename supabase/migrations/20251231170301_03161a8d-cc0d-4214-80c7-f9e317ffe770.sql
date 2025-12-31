-- Fix profiles visibility: allow authenticated users to see all non-deleted profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Authenticated users can view active profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (deleted_at IS NULL);

-- Update posts policy to also filter out banned users (penalty_level = 3)
DROP POLICY IF EXISTS "Users can view posts from non-blocked users" ON public.posts;

CREATE POLICY "Users can view posts from non-blocked and non-banned users"
ON public.posts
FOR SELECT
TO authenticated
USING (
  -- Not blocked by or blocking the current user
  NOT EXISTS (
    SELECT 1 FROM user_blocks
    WHERE (user_blocks.blocker_id = auth.uid() AND user_blocks.blocked_id = posts.user_id)
       OR (user_blocks.blocker_id = posts.user_id AND user_blocks.blocked_id = auth.uid())
  )
  -- Post author is not banned (penalty_level = 3)
  AND NOT EXISTS (
    SELECT 1 FROM user_penalties
    WHERE user_penalties.user_id = posts.user_id
      AND user_penalties.penalty_level = 3
      AND (user_penalties.expires_at IS NULL OR user_penalties.expires_at > now())
  )
);