-- ============================================================================
-- Seed the product catalog with the six launch items.
-- Requires the `products` related tables to exist (see schema-reference.sql).
-- Idempotent: safe to re-run. Explicit IDs are used so related rows and
-- sequences stay consistent with production.
-- ============================================================================

-- Product 1: 3D Printed Karambit Foldable Fidget Toy
INSERT INTO products (id, slug, name, price, material, category, description, detailed_description, specifications, metadata, created_at, updated_at) VALUES (1, '3d-printed-karambit-foldable-fidget-toy', '3D Printed Karambit Foldable Fidget Toy', 8.99, 'PLA', 'Fidget', 'Custom-designed smooth folding karambit fidget toy with multiple pin and blade options.', 'This 3D-printed karambit fidget toy features a sleek design with selectable hilt+blade color combinations and satisfying tactile feedback. Ideal as a fidget, gamer gift, or cosplay prop. Made from durable PLA. Defaults to White hilt and Black blade with Flow-Rounded pins if no customizations are selected.', '{"dimensions":"8 in. x 2.5 in. x 1 in.","weight":"50gs","resolution":"0.08-0.16mm"}'::jsonb, NULL, now(), now())
ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, url, alt_text, position) VALUES (1, 1, 'https://i.postimg.cc/fTd2RDZy/Custom-Print-Design.avif', NULL, 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, url, alt_text, position) VALUES (2, 1, 'https://i.postimg.cc/t4Hr1wC5/il-1588x-N-7094550225-3a2p.avif', NULL, 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, url, alt_text, position) VALUES (3, 1, 'https://i.postimg.cc/pVpc3K6D/Protara-Printing-Image.avif', NULL, 2) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, url, alt_text, position) VALUES (4, 1, 'https://i.postimg.cc/jCYLqsXy/Protara-Printing-Image-1.avif', NULL, 3) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, url, alt_text, position) VALUES (5, 1, 'https://i.postimg.cc/6qv8N7d9/Protara-Printing-Image-3.avif', NULL, 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_customizations (id, product_id, type, label) VALUES (1, 1, 'Pin Type', 'Pin Type') ON CONFLICT (id) DO NOTHING;
INSERT INTO customization_options (id, customization_id, option_value, price_delta, position) VALUES (1, 1, 'Flow-Rounded', 0.00, 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO customization_options (id, customization_id, option_value, price_delta, position) VALUES (2, 1, 'Geometric-Hex', 0.00, 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_customizations (id, product_id, type, label) VALUES (2, 1, 'Hilt Color', 'Hilt Color') ON CONFLICT (id) DO NOTHING;
INSERT INTO customization_options (id, customization_id, option_value, price_delta, position) VALUES (3, 2, 'White', 0.00, 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO customization_options (id, customization_id, option_value, price_delta, position) VALUES (4, 2, 'Black', 0.00, 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO customization_options (id, customization_id, option_value, price_delta, position) VALUES (5, 2, 'Red', 0.00, 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO customization_options (id, customization_id, option_value, price_delta, position) VALUES (6, 2, 'Blue', 0.00, 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO customization_options (id, customization_id, option_value, price_delta, position) VALUES (7, 2, 'Green', 0.00, 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_customizations (id, product_id, type, label) VALUES (3, 1, 'Blade Color', 'Blade Color') ON CONFLICT (id) DO NOTHING;
INSERT INTO customization_options (id, customization_id, option_value, price_delta, position) VALUES (8, 3, 'White', 0.00, 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO customization_options (id, customization_id, option_value, price_delta, position) VALUES (9, 3, 'Black', 0.00, 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO customization_options (id, customization_id, option_value, price_delta, position) VALUES (10, 3, 'Red', 0.00, 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO customization_options (id, customization_id, option_value, price_delta, position) VALUES (11, 3, 'Blue', 0.00, 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO customization_options (id, customization_id, option_value, price_delta, position) VALUES (12, 3, 'Green', 0.00, 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_customizations_json (product_id, customizations, updated_at) VALUES (1, '[{"type":"Pin Type","label":"Pin Type","options":["Flow-Rounded","Geometric-Hex"],"priceDelta":{"Flow-Rounded":0,"Geometric-Hex":0}},{"type":"Hilt Color","label":"Hilt Color","options":["White","Black","Red","Blue","Green"],"priceDelta":{"White":0,"Black":0,"Red":0,"Blue":0,"Green":0}},{"type":"Blade Color","label":"Blade Color","options":["White","Black","Red","Blue","Green"],"priceDelta":{"White":0,"Black":0,"Red":0,"Blue":0,"Green":0}}]'::jsonb, now()) ON CONFLICT (product_id) DO UPDATE SET customizations = EXCLUDED.customizations, updated_at = now();

-- Product 2: Harry Potter Deathly Hallows Rotating Keychain
INSERT INTO products (id, slug, name, price, material, category, description, detailed_description, specifications, metadata, created_at, updated_at) VALUES (2, 'harry-potter-deathly-hallows-rotating-keychain', 'Harry Potter Deathly Hallows Rotating Keychain', 3.49, 'PLA', 'Keychain', 'Handcrafted rotating Deathly Hallows keychain with a detailed inner-circle design representing the Cloak, the Stone, and the Wand.', 'The design has been perfected to allow for a crisp, fidgety rotation. Printed in PLA for durability, this keychain makes the perfect everyday carry for any Harry Potter fan or collector.', '{"dimensions":"1.75 in. x 1.5 in. x 0.2 in.","weight":"50 grams","resolution":"0.08-0.16mm"}'::jsonb, NULL, now(), now())
ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, url, alt_text, position) VALUES (6, 2, 'https://i.postimg.cc/BvnBH0Wx/Harry-Potter-DH-IMG-6080.jpg', NULL, 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, url, alt_text, position) VALUES (7, 2, 'https://i.postimg.cc/1z7cKjPb/Harry-Potter-DH-IMG-6081.jpg', NULL, 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, url, alt_text, position) VALUES (8, 2, 'https://i.postimg.cc/k4VNYvgG/Harry-Potter-DH-IMG-6083.jpg', NULL, 2) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, url, alt_text, position) VALUES (9, 2, 'https://i.postimg.cc/NMW632K4/Harry-Potter-DH-IMG-6086.jpg', NULL, 3) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_customizations (id, product_id, type, label) VALUES (4, 2, 'Color', 'Color') ON CONFLICT (id) DO NOTHING;
INSERT INTO customization_options (id, customization_id, option_value, price_delta, position) VALUES (13, 4, 'White', 0.00, 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO customization_options (id, customization_id, option_value, price_delta, position) VALUES (14, 4, 'Black', 0.00, 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO customization_options (id, customization_id, option_value, price_delta, position) VALUES (15, 4, 'Red', 0.00, 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO customization_options (id, customization_id, option_value, price_delta, position) VALUES (16, 4, 'Blue', 0.00, 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO customization_options (id, customization_id, option_value, price_delta, position) VALUES (17, 4, 'Green', 0.00, 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_customizations_json (product_id, customizations, updated_at) VALUES (2, '[{"type":"Color","label":"Color","options":["White","Black","Red","Blue","Green"],"priceDelta":{"White":0,"Black":0,"Red":0,"Blue":0,"Green":0}}]'::jsonb, now()) ON CONFLICT (product_id) DO UPDATE SET customizations = EXCLUDED.customizations, updated_at = now();

-- Product 3: Chess Piece Set
INSERT INTO products (id, slug, name, price, material, category, description, detailed_description, specifications, metadata, created_at, updated_at) VALUES (3, 'chess-piece-set', 'Chess Piece Set', 14.99, 'PLA', 'Board Game', 'Custom-designed 3D printed chess set featuring unique, modern pieces with a sleek aesthetic.', 'This 3D printed chess set is crafted with attention to detail, offering a modern twist on the classic game. Each piece is custom-designed for smooth handling and durability. Printed in PLA at high resolution, the set is lightweight yet sturdy, making it perfect for both display and regular play. Ideal for collectors, casual players, or as a unique gift.', '{"dimensions":"1.7 x 1.7 x 3.75 inches (individual pieces vary)","weight":"300 grams","resolution":"0.08-0.16mm"}'::jsonb, NULL, now(), now())
ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, url, alt_text, position) VALUES (10, 3, 'https://i.postimg.cc/RhtbnBrM/Chess-Set-Aarush-Fixed.png', NULL, 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, url, alt_text, position) VALUES (11, 3, 'https://i.postimg.cc/QtwytMy4/Chess-Set-IMG-8590.jpg', NULL, 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, url, alt_text, position) VALUES (12, 3, 'https://i.postimg.cc/NM5nBXp2/Chess-Set-IMG-8592.jpg', NULL, 2) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, url, alt_text, position) VALUES (13, 3, 'https://i.postimg.cc/3wLqs1CH/Chess-Set-IMG-8593.jpg', NULL, 3) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, url, alt_text, position) VALUES (14, 3, 'https://i.postimg.cc/XJzrhRz6/Chess-Set-IMG-8594.jpg', NULL, 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, url, alt_text, position) VALUES (15, 3, 'https://i.postimg.cc/7bvfPg4B/Chess-Set-IMG-8596.jpg', NULL, 5) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, url, alt_text, position) VALUES (16, 3, 'https://i.postimg.cc/Y0Lvwd5G/Chess-Set-IMG-8597.jpg', NULL, 6) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, url, alt_text, position) VALUES (17, 3, 'https://i.postimg.cc/PxxLSXKM/Chess-Set-IMG-8598.jpg', NULL, 7) ON CONFLICT (id) DO NOTHING;

-- Product 4: Avocado Keychain
INSERT INTO products (id, slug, name, price, material, category, description, detailed_description, specifications, metadata, created_at, updated_at) VALUES (4, 'avocado-keychain', 'Avocado Keychain', 2.99, 'PLA', 'Keychain', 'Custom-designed 3D printed avocado keychain with a rotating seed fidget feature. Supports The Food Lounge!', 'This 3D printed avocado keychain combines fun design with functionality. Shaped like a cheerful avocado, it features a smooth rotating seed at the center, doubling as a compact fidget toy for stress relief and idle play. The keychain is lightweight yet durable, printed in PLA with a high-resolution finish that highlights the vibrant green body, orange seed, and playful facial details. Perfect as a quirky accessory, a gift for avocado lovers, or a portable fidget companion to keep your hands busy on the go. Additionally, this product supports the Food Lounge, a non-profit dedicated to aiding individuals with food instability.', '{"dimensions":"","weight":"","resolution":"0.08-0.16mm"}'::jsonb, NULL, now(), now())
ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, url, alt_text, position) VALUES (18, 4, 'https://i.postimg.cc/pLCzDrBT/Full-Avocado-Aug-4-2025-Render-1.png', NULL, 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, url, alt_text, position) VALUES (19, 4, 'https://i.postimg.cc/4NzzxB7p/Full-Avocado-Aug-4-2025-from-Food-Lounge.png', NULL, 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, url, alt_text, position) VALUES (20, 4, 'https://i.postimg.cc/8zNLJMM9/Full-Avocado-Aug-4-2025-Render-2.png', NULL, 2) ON CONFLICT (id) DO NOTHING;

-- Product 5: Food Lounge Logo Keychain
INSERT INTO products (id, slug, name, price, material, category, description, detailed_description, specifications, metadata, created_at, updated_at) VALUES (5, 'food-lounge-logo-keychain', 'Food Lounge Logo Keychain', 2.99, 'PLA', 'Keychain', 'Custom-designed 3D printed keychain featuring the Food Lounge logo, representing and supporting a nonprofit dedicated to addressing food instability.', 'This 3D printed keychain is crafted to represent the Food Lounge''s mission of combating food instability and promoting community support. The design showcases the Food Lounge logo. This keychain combines a sleek finish with bold colors that highlight its meaningful design. Lightweight and practical, it serves as both a stylish accessory and a daily reminder of the importance of food security. Perfect for volunteers, supporters, and anyone who wants to carry a symbol of positive change. Additionally, proceeds go to the food lounge.', '{"dimensions":"","weight":"","resolution":"0.08-0.16mm"}'::jsonb, NULL, now(), now())
ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, url, alt_text, position) VALUES (21, 5, 'https://i.postimg.cc/KctKP4G2/60-Scale-Parts-40mm-Aug-4-2025.png', NULL, 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, url, alt_text, position) VALUES (22, 5, 'https://i.postimg.cc/Fzb7NCWR/Food-Lounge-60-Scale-Parts-Aug-4-2025.png', NULL, 1) ON CONFLICT (id) DO NOTHING;

-- Product 6: Hexagon Fidget
INSERT INTO products (id, slug, name, price, material, category, description, detailed_description, specifications, metadata, created_at, updated_at) VALUES (6, 'hexagon-fidget', 'Hexagon Fidget', 5.99, 'PLA', 'Fidget', 'This 3D printed hexagon fidget toy extends and collapses smoothly, offering a satisfying tactile and visual experience. Perfect for stress relief, focus, or sensory play, it's a unique handheld companion for work, home, or travel.', 'This 3D printed hexagon fidget toy combines innovation, design, and relaxation in one compact form. Expertly crafted using high-quality 3D printing technology, it features smooth edges and an ergonomic structure for effortless handling. The hexagonal sections extend and retract fluidly, creating a mesmerizing motion that engages both the hands and mind. Ideal for easing stress, improving focus, or simply passing time, this extendable fidget toy suits all ages and settings - whether on a desk, in a classroom, or during travel. Its geometric precision and tactile feedback make it as visually intriguing as it is soothing to use. A thoughtful and creative gift for anyone who enjoys unique, functional designs or needs a moment of calm in their day.', '{"dimensions":"4.75 in x 4.75 in x 0.3 inch (small), 7.0 in x 7.0 in x 0.3 inch (large)","weight":"","resolution":"0.08-0.16mm"}'::jsonb, NULL, now(), now())
ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, url, alt_text, position) VALUES (23, 6, 'https://i.postimg.cc/02Rv9y1V/IMG-6247.jpg', NULL, 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, url, alt_text, position) VALUES (24, 6, 'https://i.postimg.cc/7Y84qZrX/IMG-6251.jpg', NULL, 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, url, alt_text, position) VALUES (25, 6, 'https://i.postimg.cc/fTnsMRQH/IMG-6249.jpg', NULL, 2) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, url, alt_text, position) VALUES (26, 6, 'https://i.postimg.cc/15GQX1yc/Hexagon-Superfidget-stl-2025-Oct-16-04-37-13-AM-000-Customized-View28069185284.png', NULL, 3) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_images (id, product_id, url, alt_text, position) VALUES (27, 6, 'https://i.postimg.cc/vHFyGZwv/small-2025-Oct-16-03-48-54-AM-000-Customized-View35037073382.png', NULL, 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_customizations (id, product_id, type, label) VALUES (5, 6, 'Color', 'Color') ON CONFLICT (id) DO NOTHING;
INSERT INTO customization_options (id, customization_id, option_value, price_delta, position) VALUES (18, 5, 'Blue', 0.00, 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO customization_options (id, customization_id, option_value, price_delta, position) VALUES (19, 5, 'Yellow', 0.00, 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO customization_options (id, customization_id, option_value, price_delta, position) VALUES (20, 5, 'Orange', 0.00, 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO customization_options (id, customization_id, option_value, price_delta, position) VALUES (21, 5, 'Red', 0.00, 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO customization_options (id, customization_id, option_value, price_delta, position) VALUES (22, 5, 'Green', 0.00, 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO customization_options (id, customization_id, option_value, price_delta, position) VALUES (23, 5, 'Black', 0.00, 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_customizations (id, product_id, type, label) VALUES (6, 6, 'Size', 'Size') ON CONFLICT (id) DO NOTHING;
INSERT INTO customization_options (id, customization_id, option_value, price_delta, position) VALUES (24, 6, 'Small', 0.00, 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO customization_options (id, customization_id, option_value, price_delta, position) VALUES (25, 6, 'Large', 2.00, 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO product_customizations_json (product_id, customizations, updated_at) VALUES (6, '[{"type":"Color","label":"Color","options":["Blue","Yellow","Orange","Red","Green","Black"],"priceDelta":{"Yellow":0,"Orange":0,"Red":0,"Green":0,"Black":0,"Blue":0}},{"type":"Size","label":"Size","options":["Small","Large"],"priceDelta":{"Small":0,"Large":2}}]'::jsonb, now()) ON CONFLICT (product_id) DO UPDATE SET customizations = EXCLUDED.customizations, updated_at = now();

-- Align sequences with the seeded IDs.
SELECT setval(pg_get_serial_sequence('products', 'id'), 6, true);
SELECT setval(pg_get_serial_sequence('product_images', 'id'), 27, true);
SELECT setval(pg_get_serial_sequence('product_customizations', 'id'), 6, true);
SELECT setval(pg_get_serial_sequence('customization_options', 'id'), 25, true);