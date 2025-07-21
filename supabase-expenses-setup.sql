-- Clear all existing data and drop the table completely
DROP TABLE IF EXISTS shawarma_expenses CASCADE;

-- Recreate the expenses table
CREATE TABLE shawarma_expenses (
  id BIGSERIAL PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('seri_ternak', 'balaji', 'wraps', 'marketing', 'other', 'weekly_expense')),
  description TEXT,
  amount INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_expenses_category ON shawarma_expenses(category);
CREATE INDEX idx_expenses_created_at ON shawarma_expenses(created_at);

-- Enable RLS
ALTER TABLE shawarma_expenses ENABLE ROW LEVEL SECURITY;

-- Create a single comprehensive policy that allows everything
CREATE POLICY "Allow all operations" ON shawarma_expenses
  FOR ALL USING (true) WITH CHECK (true); 