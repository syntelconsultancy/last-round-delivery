-- ==========================================
-- SEED DATA: Last Round Delivery (Lusaka Pilot)
-- ==========================================

-- 1. Insert Stores (Internal Warehouse + 1 Partner Store)
INSERT INTO stores (id, name, is_internal_store, commission_rate, latitude, longitude, is_open, opening_time, closing_time) VALUES
('a0000000-0000-0000-0000-000000000001', 'Last Round Express Warehouse (Ibex Hill)', TRUE, 0.0000, -15.4167, 28.3333, TRUE, '10:00:00', '23:00:00'),
('b0000000-0000-0000-0000-000000000002', 'Woodlands Liquor Hub', FALSE, 0.1500, -15.4300, 28.3100, TRUE, '10:00:00', '22:00:00');

-- 2. Insert Master Products
INSERT INTO master_products (id, name, category, volume_ml, abv_percentage, is_alcoholic, image_url) VALUES
-- Whiskies & Spirits
('p0000000-0000-0000-0000-000000000003', 'Jameson Triple Distilled Irish Whiskey', 'Whiskey', 750, 40.00, TRUE, 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4'),
('p0000000-0000-0000-0000-000000000006', 'Johnnie Walker Black Label (12 Years)', 'Whiskey', 750, 40.00, TRUE, 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4'),
('p0000000-0000-0000-0000-000000000007', 'Johnnie Walker Red Label', 'Whiskey', 750, 40.00, TRUE, 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4'),
('p0000000-0000-0000-0000-000000000008', 'Gordon''s Premium Pink Gin', 'Whiskey', 750, 37.50, TRUE, 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b'),
('p0000000-0000-0000-0000-000000000009', 'Jägermeister', 'Whiskey', 750, 35.00, TRUE, 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b'),
('p0000000-0000-0000-0000-000000000010', 'Bells Blended Scotch Whisky', 'Whiskey', 750, 40.00, TRUE, 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4'),

-- Wines
('p0000000-0000-0000-0000-000000000011', 'Four Cousins / Cellar Cask', 'Wine', 750, 11.50, TRUE, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3'),
('p0000000-0000-0000-0000-000000000012', 'Robertson Winery Natural Sweet Rose / Red', 'Wine', 750, 11.50, TRUE, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3'),
('p0000000-0000-0000-0000-000000000013', 'J.C. Le Roux (Sparkling Wine)', 'Wine', 750, 11.00, TRUE, 'https://images.unsplash.com/photo-1578916171728-46686eac8d58'),
('p0000000-0000-0000-0000-000000000014', 'Nederburg The Winemasters Merlot', 'Wine', 750, 14.00, TRUE, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3'),

-- Beers & Ciders
('p0000000-0000-0000-0000-000000000001', 'Mosi Premium Lager (Quart)', 'Beer', 750, 4.00, TRUE, 'https://images.unsplash.com/photo-1608270119061-4043b27b8764'),
('p0000000-0000-0000-0000-000000000015', 'Mosi Premium Lager (Dumpie)', 'Beer', 375, 4.00, TRUE, 'https://images.unsplash.com/photo-1608270119061-4043b27b8764'),
('p0000000-0000-0000-0000-000000000016', 'Black Label', 'Beer', 500, 5.50, TRUE, 'https://images.unsplash.com/photo-1535958636474-b021ee887b13'),
('p0000000-0000-0000-0000-000000000017', 'Castle Lager', 'Beer', 500, 5.00, TRUE, 'https://images.unsplash.com/photo-1535958636474-b021ee887b13'),
('p0000000-0000-0000-0000-000000000002', 'Castle Lite', 'Beer', 500, 4.00, TRUE, 'https://images.unsplash.com/photo-1535958636474-b021ee887b13'),
('p0000000-0000-0000-0000-000000000018', 'Windhoek Draught / Premium Lager', 'Beer', 440, 4.00, TRUE, 'https://images.unsplash.com/photo-1608270119061-4043b27b8764'),
('p0000000-0000-0000-0000-000000000019', 'Savanna Dry Cider', 'Beer', 330, 5.50, TRUE, 'https://images.unsplash.com/photo-1535958636474-b021ee887b13'),

-- Mixers & Ice
('p0000000-0000-0000-0000-000000000004', 'Red Bull Energy Drink', 'Mixers', 250, 0.00, FALSE, 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e'),
('p0000000-0000-0000-0000-000000000005', 'Party Ice Bag', 'Ice', 2000, 0.00, FALSE, 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7');

-- 3. Insert Store Inventory (Prices in Zambian Kwacha - ZMW)
INSERT INTO store_inventory (store_id, product_id, price_zmw, stock_quantity, is_chilled) VALUES
-- Internal Warehouse Inventory (Ibex Hill)
('a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000003', 730.00, 25, FALSE), -- Jameson
('a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000006', 1050.00, 15, FALSE), -- JW Black
('a0000000-0000-0000-0000-000000000007', 'p0000000-0000-0000-0000-000000000007', 455.00, 30, FALSE), -- JW Red
('a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000008', 420.00, 20, TRUE), -- Gordon's Pink Gin
('a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000009', 420.00, 25, TRUE), -- Jägermeister
('a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000010', 395.00, 25, FALSE), -- Bells
('a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000011', 120.00, 40, FALSE), -- Four Cousins
('a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000012', 210.00, 30, FALSE), -- Robertson Winery
('a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000013', 220.00, 20, TRUE), -- JC Le Roux
('a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000014', 295.00, 20, FALSE), -- Nederburg Merlot
('a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000001', 25.00, 150, TRUE), -- Mosi Quart
('a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000015', 15.00, 100, TRUE), -- Mosi Dumpie
('a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000016', 35.00, 120, TRUE), -- Black Label
('a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000017', 35.00, 120, TRUE), -- Castle Lager
('a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000002', 35.00, 120, TRUE), -- Castle Lite
('a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000018', 40.00, 90, TRUE), -- Windhoek Draught
('a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000019', 40.00, 90, TRUE), -- Savanna Dry
('a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000004', 30.00, 200, TRUE), -- Red Bull
('a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000005', 20.00, 50, FALSE); -- Ice

-- Partner Store Inventory (Woodlands Liquor Hub)
('b0000000-0000-0000-0000-000000000002', 'p0000000-0000-0000-0000-000000000003', 750.00, 10, FALSE), -- Jameson at partner
('b0000000-0000-0000-0000-000000000002', 'p0000000-0000-0000-0000-000000000001', 27.00, 80, TRUE); -- Mosi Quart at partner
