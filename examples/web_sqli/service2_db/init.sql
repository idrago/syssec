-- Initialize the database
USE users;

CREATE TABLE IF NOT EXISTS `credential` (
  `ID` int(6) unsigned NOT NULL AUTO_INCREMENT,
  `Name` varchar(30) NOT NULL,
  `Password` varchar(300) DEFAULT NULL,
  `isAdmin` int(1) DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Insert non-admin users from student01 to student20
INSERT INTO `credential` (`Name`, `Password`, `isAdmin`) 
VALUES ('student01', '$2y$10$WaAQGaF/GmaHPxrr6Pjvm.2qmKKoUAeaKR2iWeieBezaGYizI9eKC', 0);
INSERT INTO `credential` (`Name`, `Password`, `isAdmin`) 
VALUES ('student02', '$2y$10$WaAQGaF/GmaHPxrr6Pjvm.2qmKKoUAeaKR2iWeieBezaGYizI9eKC', 0);
INSERT INTO `credential` (`Name`, `Password`, `isAdmin`) 
VALUES ('student03', '$2y$10$WaAQGaF/GmaHPxrr6Pjvm.2qmKKoUAeaKR2iWeieBezaGYizI9eKC', 0);
INSERT INTO `credential` (`Name`, `Password`, `isAdmin`) 
VALUES ('student04', '$2y$10$WaAQGaF/GmaHPxrr6Pjvm.2qmKKoUAeaKR2iWeieBezaGYizI9eKC', 0);
INSERT INTO `credential` (`Name`, `Password`, `isAdmin`) 
VALUES ('student05', '$2y$10$WaAQGaF/GmaHPxrr6Pjvm.2qmKKoUAeaKR2iWeieBezaGYizI9eKC', 0);
INSERT INTO `credential` (`Name`, `Password`, `isAdmin`) 
VALUES ('student06', '$2y$10$WaAQGaF/GmaHPxrr6Pjvm.2qmKKoUAeaKR2iWeieBezaGYizI9eKC', 0);
INSERT INTO `credential` (`Name`, `Password`, `isAdmin`) 
VALUES ('student07', '$2y$10$WaAQGaF/GmaHPxrr6Pjvm.2qmKKoUAeaKR2iWeieBezaGYizI9eKC', 0);
INSERT INTO `credential` (`Name`, `Password`, `isAdmin`) 
VALUES ('student08', '$2y$10$WaAQGaF/GmaHPxrr6Pjvm.2qmKKoUAeaKR2iWeieBezaGYizI9eKC', 0);
INSERT INTO `credential` (`Name`, `Password`, `isAdmin`) 
VALUES ('student09', '$2y$10$WaAQGaF/GmaHPxrr6Pjvm.2qmKKoUAeaKR2iWeieBezaGYizI9eKC', 0);
INSERT INTO `credential` (`Name`, `Password`, `isAdmin`) 
VALUES ('student10', '$2y$10$WaAQGaF/GmaHPxrr6Pjvm.2qmKKoUAeaKR2iWeieBezaGYizI9eKC', 0);
INSERT INTO `credential` (`Name`, `Password`, `isAdmin`) 
VALUES ('student11', '$2y$10$WaAQGaF/GmaHPxrr6Pjvm.2qmKKoUAeaKR2iWeieBezaGYizI9eKC', 0);
INSERT INTO `credential` (`Name`, `Password`, `isAdmin`) 
VALUES ('student12', '$2y$10$WaAQGaF/GmaHPxrr6Pjvm.2qmKKoUAeaKR2iWeieBezaGYizI9eKC', 0);
INSERT INTO `credential` (`Name`, `Password`, `isAdmin`) 
VALUES ('student13', '$2y$10$WaAQGaF/GmaHPxrr6Pjvm.2qmKKoUAeaKR2iWeieBezaGYizI9eKC', 0);
INSERT INTO `credential` (`Name`, `Password`, `isAdmin`) 
VALUES ('student14', '$2y$10$WaAQGaF/GmaHPxrr6Pjvm.2qmKKoUAeaKR2iWeieBezaGYizI9eKC', 0);
INSERT INTO `credential` (`Name`, `Password`, `isAdmin`) 
VALUES ('student15', '$2y$10$WaAQGaF/GmaHPxrr6Pjvm.2qmKKoUAeaKR2iWeieBezaGYizI9eKC', 0);
INSERT INTO `credential` (`Name`, `Password`, `isAdmin`) 
VALUES ('student16', '$2y$10$WaAQGaF/GmaHPxrr6Pjvm.2qmKKoUAeaKR2iWeieBezaGYizI9eKC', 0);
INSERT INTO `credential` (`Name`, `Password`, `isAdmin`) 
VALUES ('student17', '$2y$10$WaAQGaF/GmaHPxrr6Pjvm.2qmKKoUAeaKR2iWeieBezaGYizI9eKC', 0);
INSERT INTO `credential` (`Name`, `Password`, `isAdmin`) 
VALUES ('student18', '$2y$10$WaAQGaF/GmaHPxrr6Pjvm.2qmKKoUAeaKR2iWeieBezaGYizI9eKC', 0);
INSERT INTO `credential` (`Name`, `Password`, `isAdmin`) 
VALUES ('student19', '$2y$10$WaAQGaF/GmaHPxrr6Pjvm.2qmKKoUAeaKR2iWeieBezaGYizI9eKC', 0);