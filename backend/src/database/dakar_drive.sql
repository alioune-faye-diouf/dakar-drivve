-- Création de la base de données
CREATE DATABASE IF NOT EXISTS dakar_drive;
USE dakar_drive;

-- Table cars
CREATE TABLE IF NOT EXISTS cars (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    description TEXT,
    transmission VARCHAR(50) NOT NULL,
    horsepower INT NOT NULL,
    price_per_day DECIMAL(10,2) NOT NULL,
    available BOOLEAN DEFAULT TRUE,
    image_url VARCHAR(500)
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

-- Insertion de quelques véhicules de démonstration
INSERT INTO cars (name, brand, model, year, description, transmission, horsepower, price_per_day, available, image_url) VALUES
('Mercedes GLE 350d', 'Mercedes', 'GLE', 2024, 'SUV de luxe avec finitions AMG Line, sellerie cuir Nappa, toit ouvrant panoramique.', 'Automatique', 272, 150000, TRUE, '/images/gle.jpg'),
('Range Rover Sport', 'Land Rover', 'Range Rover Sport', 2023, 'Élégance britannique et capacités tout-terrain. Parfait pour les mariages et cérémonies.', 'Automatique', 300, 175000, TRUE, '/images/rrs.jpg'),
('Porsche Cayenne', 'Porsche', 'Cayenne', 2024, 'Sportivité et confort pour les trajets vers l\'aéroport ou les rendez-vous d\'affaires.', 'Automatique', 340, 200000, TRUE, '/images/cayenne.jpg');