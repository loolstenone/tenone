-- 쇼핑몰 상품 + 주문 + 프로모션 테이블

-- 1. shop_products
CREATE TABLE IF NOT EXISTS shop_products (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site        text NOT NULL DEFAULT 'tenone',
  name        text NOT NULL,
  description text,
  price       integer NOT NULL DEFAULT 0,
  stock       integer NOT NULL DEFAULT 0,
  category    text DEFAULT '기타',
  image_url   text,
  status      text DEFAULT 'active',  -- active | inactive | soldout
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shop_products_site ON shop_products(site);
CREATE INDEX IF NOT EXISTS idx_shop_products_status ON shop_products(status);

ALTER TABLE shop_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "shop_products_read_all" ON shop_products FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "shop_products_write_admin" ON shop_products FOR ALL
  USING (auth.jwt() ->> 'role' IN ('super_admin', 'admin'));

-- 2. shop_orders
CREATE TABLE IF NOT EXISTS shop_orders (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site          text NOT NULL DEFAULT 'tenone',
  product_id    uuid REFERENCES shop_products(id) ON DELETE SET NULL,
  product_name  text NOT NULL,
  buyer_name    text NOT NULL,
  buyer_email   text NOT NULL,
  buyer_phone   text,
  amount        integer NOT NULL DEFAULT 0,
  quantity      integer NOT NULL DEFAULT 1,
  status        text DEFAULT 'pending',  -- pending | paid | shipped | delivered | cancelled
  note          text,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shop_orders_site ON shop_orders(site);
CREATE INDEX IF NOT EXISTS idx_shop_orders_status ON shop_orders(status);

ALTER TABLE shop_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "shop_orders_read_admin" ON shop_orders FOR SELECT
  USING (auth.jwt() ->> 'role' IN ('super_admin', 'admin'));
CREATE POLICY IF NOT EXISTS "shop_orders_write_all" ON shop_orders FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "shop_orders_update_admin" ON shop_orders FOR UPDATE
  USING (auth.jwt() ->> 'role' IN ('super_admin', 'admin'));

-- 3. promotions
CREATE TABLE IF NOT EXISTS promotions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site          text NOT NULL DEFAULT 'tenone',
  name          text NOT NULL,
  code          text UNIQUE NOT NULL,
  type          text NOT NULL DEFAULT 'percent',  -- percent | fixed
  value         integer NOT NULL DEFAULT 0,
  min_order     integer DEFAULT 0,
  start_date    date,
  end_date      date,
  usage_limit   integer DEFAULT 0,
  used_count    integer DEFAULT 0,
  status        text DEFAULT 'active',  -- active | inactive | expired
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_promotions_site ON promotions(site);
CREATE INDEX IF NOT EXISTS idx_promotions_code ON promotions(code);
CREATE INDEX IF NOT EXISTS idx_promotions_status ON promotions(status);

ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "promotions_read_active" ON promotions FOR SELECT USING (status = 'active');
CREATE POLICY IF NOT EXISTS "promotions_write_admin" ON promotions FOR ALL
  USING (auth.jwt() ->> 'role' IN ('super_admin', 'admin'));
