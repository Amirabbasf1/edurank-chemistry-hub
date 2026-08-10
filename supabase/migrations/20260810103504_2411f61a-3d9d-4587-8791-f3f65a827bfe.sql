-- Fix missing foreign key relationships for PostgREST joins
ALTER TABLE public.user_roles 
  DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey,
  ADD CONSTRAINT user_roles_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.audit_logs
  DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey,
  ADD CONSTRAINT audit_logs_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Re-grant access just in case
GRANT SELECT ON public.user_roles TO authenticated, service_role;
GRANT SELECT ON public.profiles TO authenticated, service_role;
GRANT SELECT ON public.audit_logs TO authenticated, service_role;
