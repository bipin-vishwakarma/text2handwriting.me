-- Student profile fields are private by default. Users may read only their
-- own row; public-facing profile data should live in a separate safe view.
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;

create policy "Users can read own profile."
  on public.profiles for select
  using ((select auth.uid()) = id);
