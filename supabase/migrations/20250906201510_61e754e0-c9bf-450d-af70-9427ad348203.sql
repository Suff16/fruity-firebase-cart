-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create fruits table
CREATE TABLE public.fruits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  image TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fruit_id UUID NOT NULL REFERENCES public.fruits(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  customer_name TEXT NOT NULL,
  contact TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storage bucket for fruit images
INSERT INTO storage.buckets (id, name, public) VALUES ('fruit-images', 'fruit-images', true);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fruits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE profiles.user_id = $1;
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for fruits
CREATE POLICY "Anyone can view fruits"
ON public.fruits FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Only admins can insert fruits"
ON public.fruits FOR INSERT
TO authenticated
WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Only admins can update fruits"
ON public.fruits FOR UPDATE
TO authenticated
USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Only admins can delete fruits"
ON public.fruits FOR DELETE
TO authenticated
USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for orders
CREATE POLICY "Anyone can view orders"
ON public.orders FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Anyone can create orders"
ON public.orders FOR INSERT
TO authenticated, anon
WITH CHECK (true);

CREATE POLICY "Only admins can update orders"
ON public.orders FOR UPDATE
TO authenticated
USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Only admins can delete orders"
ON public.orders FOR DELETE
TO authenticated
USING (public.get_user_role(auth.uid()) = 'admin');

-- Storage policies for fruit images
CREATE POLICY "Anyone can view fruit images"
ON storage.objects FOR SELECT
TO authenticated, anon
USING (bucket_id = 'fruit-images');

CREATE POLICY "Only admins can upload fruit images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'fruit-images' AND public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Only admins can update fruit images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'fruit-images' AND public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Only admins can delete fruit images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'fruit-images' AND public.get_user_role(auth.uid()) = 'admin');

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    'user'
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fruits_updated_at
BEFORE UPDATE ON public.fruits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample fruits data
INSERT INTO public.fruits (name, price, stock, description, image) VALUES
('Apel Fuji', 15000, 50, 'Apel Fuji segar dan manis langsung dari kebun pilihan. Kaya vitamin C dan serat yang baik untuk kesehatan.', 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=500'),
('Jeruk Manis', 12000, 75, 'Jeruk manis segar dengan kandungan vitamin C tinggi. Cocok untuk jus atau dimakan langsung.', 'https://images.unsplash.com/photo-1547514701-42782101795e?w=500'),
('Pisang Cavendish', 8000, 100, 'Pisang Cavendish matang sempurna, kaya kalium dan energi. Sempurna untuk sarapan sehat.', 'https://images.unsplash.com/photo-1543218024-57a70143c369?w=500'),
('Mangga Harum Manis', 20000, 30, 'Mangga harum manis pilihan dengan daging buah tebal dan rasa yang sangat manis.', 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=500'),
('Anggur Hijau', 25000, 40, 'Anggur hijau segar tanpa biji, manis dan renyah. Cocok untuk camilan sehat keluarga.', 'https://images.unsplash.com/photo-1515779688242-a972a8d41ddf?w=500');