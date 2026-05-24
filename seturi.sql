DROP TABLE IF EXISTS asociere_set CASCADE;
DROP TABLE IF EXISTS seturi CASCADE;

CREATE TABLE IF NOT EXISTS seturi (
    id SERIAL PRIMARY KEY,
    nume_set VARCHAR(100) NOT NULL,
    descriere_set TEXT
);

CREATE TABLE IF NOT EXISTS asociere_set (
    id SERIAL PRIMARY KEY,
    id_set INT NOT NULL REFERENCES seturi(id) ON DELETE CASCADE,
    id_produs INT NOT NULL REFERENCES produse(id) ON DELETE CASCADE
);

INSERT INTO seturi (nume_set, descriere_set) VALUES
('Set Starter H0',              'Kit complet de pornire pentru modelism feroviar la scara H0: locomotivă, vagoane și decodor digital.'),
('Set Transport Urban',         'Colecție de vehicule de transport public urban din România contemporană: autobuz, tramvai și troleibuz.'),
('Set Dioramă Rurală',          'Tot ce aveți nevoie pentru a construi o dioramă rurală autentică: vegetație, clădire și figurine.'),
('Set CFR Clasic',              'Locomotivă cu abur românească, vagon de dormit internațional și decodor sound pentru o experiență completă.'),
('Set Infrastructură Digitală', 'Componente electronice și digitale pentru automatizarea machetei: semafor, decodor și consumabile de întreținere.');

INSERT INTO asociere_set (id_set, id_produs) VALUES
(1, 1),
(1, 2),
(1, 8);

INSERT INTO asociere_set (id_set, id_produs) VALUES
(2, 3),
(2, 5),
(2, 11);

INSERT INTO asociere_set (id_set, id_produs) VALUES
(3, 7),
(3, 9),
(3, 13);

INSERT INTO asociere_set (id_set, id_produs) VALUES
(4, 4),
(4, 15),
(4, 10);

INSERT INTO asociere_set (id_set, id_produs) VALUES
(5, 6),
(5, 10),
(5, 14);
