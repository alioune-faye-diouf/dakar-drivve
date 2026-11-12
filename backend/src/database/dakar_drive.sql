-- Création de la base de données
CREATE DATABASE IF NOT EXISTS dakar_drive;
USE dakar_drive;

-- Table admins
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- Table brands (Marques)
CREATE TABLE IF NOT EXISTS brands (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    country VARCHAR(100),
    logo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table models (Modèles rattachés aux marques)
CREATE TABLE IF NOT EXISTS models (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    brand_id INT NOT NULL,
    category VARCHAR(50),
    year_start INT,
    year_end INT,
    default_fuel_type VARCHAR(50) DEFAULT 'Essence',
    default_transmission VARCHAR(50) DEFAULT 'Automatique',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE
);

-- Table cars (Véhicules en location)
CREATE TABLE IF NOT EXISTS cars (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    brand_id INT NULL,
    model VARCHAR(100) NOT NULL,
    model_id INT NULL,
    year INT NOT NULL,
    description TEXT,
    transmission VARCHAR(50) NOT NULL DEFAULT 'Automatique',
    fuel_type VARCHAR(50) NOT NULL DEFAULT 'Essence',
    horsepower INT NOT NULL DEFAULT 150,
    seats INT NOT NULL DEFAULT 5,
    price_per_day DECIMAL(10,2) NOT NULL,
    available BOOLEAN DEFAULT TRUE,
    image_url VARCHAR(500),
    features JSON,
    FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL,
    FOREIGN KEY (model_id) REFERENCES models(id) ON DELETE SET NULL
);

-- Table car_photos (Galerie photos multiple pour chaque véhicule)
CREATE TABLE IF NOT EXISTS car_photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    car_id INT NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
);

-- Table bookings
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    car_id INT NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (car_id) REFERENCES cars(id)
);

-- Table payments
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bookingId INT NOT NULL,
    payment_method ENUM('wave', 'orange_money') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'XOF',
    customer_phone VARCHAR(20) NOT NULL,
    paytech_token VARCHAR(255),
    status ENUM('pending', 'processing', 'success', 'failed', 'cancelled') DEFAULT 'pending',
    transaction_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bookingId) REFERENCES bookings(id)
);

-- Insertion de marques initiales
INSERT INTO brands (id, name, country) VALUES
(1, 'Mercedes-Benz', 'Allemagne'),
(2, 'Land Rover', 'Royaume-Uni'),
(3, 'Porsche', 'Allemagne'),
(4, 'BMW', 'Allemagne'),
(5, 'Toyota', 'Japon')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insertion de modèles initiaux
INSERT INTO models (id, name, brand_id, category, default_fuel_type, default_transmission) VALUES
(1, 'GLE', 1, 'SUV', 'Diesel', 'Automatique'),
(2, 'Classe E', 1, 'Berline de luxe', 'Essence', 'Automatique'),
(3, 'Classe S', 1, 'Berline de luxe', 'Essence', 'Automatique'),
(4, 'Range Rover Sport', 2, 'SUV', 'Diesel', 'Automatique'),
(5, 'Defender', 2, '4x4', 'Diesel', 'Automatique'),
(6, 'Cayenne', 3, 'SUV', 'Essence', 'Automatique'),
(7, 'Panamera', 3, 'Berline de luxe', 'Hybride', 'Automatique'),
(8, 'Série 7', 4, 'Berline de luxe', 'Essence', 'Automatique'),
(9, 'Land Cruiser Prado', 5, '4x4', 'Diesel', 'Automatique')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insertion de quelques véhicules de démonstration
INSERT INTO cars (id, name, brand, brand_id, model, model_id, year, description, transmission, fuel_type, horsepower, seats, price_per_day, available, image_url, features) VALUES
(1, 'Mercedes GLE 350d Pack AMG', 'Mercedes-Benz', 1, 'GLE', 1, 2024, 'SUV de grand luxe avec finitions AMG Line, sellerie cuir Nappa, toit ouvrant panoramique et audio Burmester.', 'Automatique', 'Diesel', 272, 5, 150000, TRUE, '/images/gle.jpg', '["Climatisation", "GPS Intégré", "Caméra 360 / Recul", "Toit ouvrant panoramique", "Sièges cuir ventilés"]'),
(2, 'Range Rover Sport Dynamic', 'Land Rover', 2, 'Range Rover Sport', 4, 2023, 'Élégance britannique et capacités tout-terrain. Parfait pour les réceptions de prestige, mariages et cérémonies d\'affaires.', 'Automatique', 'Diesel', 300, 5, 175000, TRUE, '/images/rrs.jpg', '["Climatisation", "GPS Intégré", "Suspension pneumatique", "Système audio Burmester/Bose", "Vitres teintées"]'),
(3, 'Porsche Cayenne Turbo GT', 'Porsche', 3, 'Cayenne', 6, 2024, 'Sportivité d\'exception et confort absolu pour vos transferts VIP aéroport et vos déplacements diplomatiques à Dakar.', 'Automatique', 'Essence', 340, 5, 200000, TRUE, '/images/cayenne.jpg', '["Climatisation", "GPS Intégré", "Bluetooth & Carplay", "Régulateur adaptatif", "Démarrage sans clé"]')
ON DUPLICATE KEY UPDATE name=VALUES(name);
