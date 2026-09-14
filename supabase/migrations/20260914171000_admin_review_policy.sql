-- Allow authenticated Bickri Verified administrators to review requests.
drop policy if exists "admins can read verification requests" on public.verification_requests;
create policy "admins can read verification requests"
on public.verification_requests
for select to authenticated
using (public.is_admin());
