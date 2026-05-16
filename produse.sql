

DROP TABLE IF EXISTS produse CASCADE;
DROP TYPE IF EXISTS categ_tren;
DROP TYPE IF EXISTS era_feroviara;

CREATE TYPE categ_tren AS ENUM (
    'machete_feroviare', 
    'transport_public', 
    'peisagistica_diorame', 
    'electronice_control', 
    'accesorii_mentenanta'
);


CREATE TYPE era_feroviara AS ENUM ('Era I', 'Era II', 'Era III', 'Era IV', 'Era V', 'Era VI');
CREATE TABLE IF NOT EXISTS produse (
    id SERIAL PRIMARY KEY,
    nume VARCHAR(100) UNIQUE NOT NULL,
    descriere TEXT,
    pret NUMERIC(10, 2) NOT NULL CHECK (pret > 0),
    scara_numitor INT NOT NULL CHECK (scara_numitor >= 0),
    categorie categ_tren DEFAULT 'machete_feroviare',
    subcategorie VARCHAR(50),
    era era_feroviara NOT NULL,
    materiale VARCHAR [],
    este_digital BOOLEAN NOT NULL DEFAULT FALSE,
    imagine VARCHAR(300),
    data_adaugare TIMESTAMP DEFAULT current_timestamp
);
INSERT INTO produse (nume, descriere, pret, scara_numitor, categorie, subcategorie, era, materiale, este_digital, imagine) VALUES 
('Locomotivă CFR 060-EA', 'Locomotivă electrică românească, schema clasică gri.', 1250.00, 87, 'machete_feroviare', 'Locomotive', 'Era IV', '{"metal", "plastic", "cupru"}', True, '060ea.jpg'),
('Vagon Călători Etajat', 'Vagon albastru de clasa a 2-a pentru trenuri regio.', 280.00, 87, 'machete_feroviare', 'Vagoane', 'Era VI', '{"plastic", "metal"}', False, 'vagon_etajat.jpg'),
('Autobuz Mercedes Citaro', 'Machetă autobuz urban folosit în București.', 190.00, 87, 'transport_public', 'Autobuze', 'Era VI', '{"plastic", "cauciuc"}', False, 'citaro.jpg'),
('Locomotivă cu Abur 150.000', 'Machetă detaliată a locomotivei cu abur CFR.', 1450.00, 87, 'machete_feroviare', 'Locomotive', 'Era III', '{"metal", "rasina"}', True, 'abur150.jpg'),
('Tramvai Astra Imperio', 'Tramvai modern produs la Arad, model galben.', 450.00, 87, 'transport_public', 'Tramvaie', 'Era VI', '{"plastic", "metal", "led"}', True, 'imperio.jpg'),
('Semafor 3 Culori', 'Semafor feroviar cu LED-uri funcționale.', 55.00, 87, 'electronice_control', 'Semnalizare', 'Era V', '{"plastic", "led"}', True, 'semafor.jpg'),
('Set 10 Brazi de Munte', 'Elemente de vegetație pentru diorame.', 85.00, 160, 'peisagistica_diorame', 'Vegetație', 'Era I', '{"nylon", "sarma"}', False, 'brazi.jpg'),
('Vagon Marfă Eaos', 'Vagon deschis pentru transport cărbune.', 135.00, 120, 'machete_feroviare', 'Vagoane', 'Era V', '{"plastic"}', False, 'eaos.jpg'),
('Gară Rurală Lemn', 'Kit de construcție gară din lemn tăiat laser.', 210.00, 87, 'peisagistica_diorame', 'Clădiri', 'Era II', '{"lemn", "carton"}', False, 'gara.jpg'),
('Decodor Sunet ESU', 'Decodor digital pentru locomotive H0.', 185.00, 87, 'electronice_control', 'Componente', 'Era VI', '{"siliciu", "cupru"}', True, 'decodor.jpg'),
('Troleibuz Solaris', 'Machetă troleibuz cu captatori mobili.', 310.00, 87, 'transport_public', 'Troleibuze', 'Era VI', '{"plastic"}', False, 'solaris.jpg'),
('Locomotivă Diesel LDH 125', 'Locomotivă hidraulică de manevră CFR.', 950.00, 87, 'machete_feroviare', 'Locomotive', 'Era IV', '{"metal", "plastic"}', True, 'ldh125.jpg'),
('Set Figurine Călători', '6 persoane pictate pentru peroane.', 60.00, 87, 'peisagistica_diorame', 'Figurine', 'Era V', '{"plastic"}', False, 'figurine.jpg'),
('Ulei Mentenanță', 'Soluție de ungere pentru roți și pinioane.', 35.00, 0, 'accesorii_mentenanta', 'Consumabile', 'Era I', '{"ulei mineral"}', False, 'ulei.jpg'),
('Vagon Dormit WLAB', 'Vagon de dormit pentru trenuri internaționale.', 295.00, 87, 'machete_feroviare', 'Vagoane', 'Era V', '{"plastic", "metal"}', False, 'dormit.jpg');
