-- phpMyAdmin SQL Dump
-- version 6.0.0-dev+20261024.6eba7ba9ad
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Oct 30, 2026 at 03:59 PM
-- Server version: 8.4.3
-- PHP Version: 8.3.36

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `hangout`
--

-- --------------------------------------------------------

--
-- Table structure for table `friends`
--
CREATE TABLE `friends` (
  `id` varchar(64) NOT NULL,
  `name` varchar(100) NOT NULL,
  `phone` varchar(30) NOT NULL,
  `role` varchar(120) NOT NULL DEFAULT '',
  `availability` varchar(120) NOT NULL DEFAULT '',
  `budget` varchar(32) NOT NULL DEFAULT 'Budget-friendly',
  `activities` json NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `friends`
--

INSERT INTO `friends` (`id`, `name`, `phone`, `role`, `availability`, `budget`, `activities`, `created_at`, `updated_at`) VALUES
('alex-03', 'Alex Thompson', '+1 (555) 012-7054', 'Product designer · football fan', 'Evenings after 5 pm', 'Budget-friendly', '[\"Football match\", \"Game night\", \"Movie night\", \"Friends hangout\"]', '2026-10-25 05:40:37', '2026-10-25 05:40:37'),
('ava-06', 'Ava Johnson', '+1 (555) 016-4518', 'Yoga instructor & trail lover', 'Weekday mornings, Sundays', 'Budget-friendly', '[\"Hiking\", \"Picnic\", \"Beach day\", \"Friends hangout\"]', '2026-10-25 05:40:37', '2026-10-25 05:40:37'),
('ethan-09', 'Ethan Kim', '+1 (555) 015-7924', 'Semi-pro footballer · fitness coach', 'Wed evenings & Sunday', 'Mid-range', '[\"Football match\", \"Hiking\", \"Beach day\", \"Friends hangout\"]', '2026-10-25 05:40:37', '2026-10-25 05:40:37'),
('isabella-08', 'Isabella Brooks', '+1 (555) 018-2065', 'Teacher · movie buff', 'Weekends & school breaks', 'Budget-friendly', '[\"Movie night\", \"Picnic\", \"Game night\", \"Friends hangout\"]', '2026-10-25 05:40:37', '2026-10-25 05:40:37'),
('jamie-01', 'Jamie Rivera', '+1 (555) 014-2861', 'Pro footballer · midfielder', 'Mon–Fri after 6 pm', 'Premium', '[\"Football match\", \"Picnic\", \"Coffee & catch-up\", \"Friends hangout\"]', '2026-10-25 05:40:37', '2026-10-25 05:40:37'),
('liam-07', 'Liam Patel', '+1 (555) 011-8743', 'Music producer · live-show regular', 'Thursday–Saturday evenings', 'Premium', '[\"Live music\", \"Dinner out\", \"Coffee & catch-up\", \"Friends hangout\"]', '2026-10-25 05:40:37', '2026-10-25 05:40:37'),
('maya-02', 'Maya Chen', '+1 (555) 017-3492', 'Photographer & weekend explorer', 'Weekends, usually free', 'Mid-range', '[\"Picnic\", \"Hiking\", \"Coffee & catch-up\", \"Friends hangout\"]', '2026-10-25 05:40:37', '2026-10-25 05:40:37'),
('noah-05', 'Noah Williams', '+1 (555) 013-9207', 'Software engineer · game-night host', 'Friday nights & weekends', 'Budget-friendly', '[\"Game night\", \"Football match\", \"Movie night\", \"Friends hangout\"]', '2026-10-25 05:40:37', '2026-10-25 05:40:37'),
('sofia-04', 'Sofia Martinez', '+1 (555) 019-6382', 'Chef in training · foodie', 'Tue & Thu evenings', 'Mid-range', '[\"Dinner out\", \"Picnic\", \"Coffee & catch-up\", \"Friends hangout\"]', '2026-10-25 05:40:37', '2026-10-25 05:40:37'),
('zoe-10', 'Zoe Carter', '+1 (555) 010-5369', 'Illustrator · beach enthusiast', 'Most Saturdays, after noon', 'Premium', '[\"Beach day\", \"Live music\", \"Dinner out\", \"Picnic\", \"Friends hangout\"]', '2026-10-25 05:40:37', '2026-10-25 05:40:37');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `friends`
--
ALTER TABLE `friends`
  ADD PRIMARY KEY (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
