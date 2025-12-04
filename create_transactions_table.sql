-- Create transactions table for storing saved transactions
CREATE TABLE IF NOT EXISTS public.transactions (
    id BIGSERIAL PRIMARY KEY,
    customer_name TEXT NOT NULL,
    date DATE NOT NULL,
    total_revenue NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_expenses NUMERIC(12, 2) NOT NULL DEFAULT 0,
    net_profit NUMERIC(12, 2) NOT NULL DEFAULT 0,
    eli_share NUMERIC(12, 2) NOT NULL DEFAULT 0,
    shimon_share NUMERIC(12, 2) NOT NULL DEFAULT 0,
    eli_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0,
    shimon_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (since RLS is enabled but we want unrestricted access)
-- You can modify this later for more security if needed
CREATE POLICY "Allow all operations on transactions" ON public.transactions
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Enable Realtime for the transactions table
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;

-- Create index on date for faster queries
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date DESC);

-- Create index on created_at for faster sorting
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);

