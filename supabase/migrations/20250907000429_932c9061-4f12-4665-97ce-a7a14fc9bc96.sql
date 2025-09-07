-- Fix security issue: Restrict orders access to admins only
-- Drop the existing public SELECT policy on orders
DROP POLICY "Anyone can view orders" ON public.orders;

-- Create new policy that only allows admins to view orders
CREATE POLICY "Only admins can view orders" 
ON public.orders 
FOR SELECT 
USING (get_user_role(auth.uid()) = 'admin'::app_role);