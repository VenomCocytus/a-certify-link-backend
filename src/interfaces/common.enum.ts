export enum CertificateType {
    CIMA = 'cima',
    POOLTPV = 'pooltpv',
    MATCA = 'matca',
    POOLTPVBLEU = 'pooltpvbleu'
}

export enum CertificateColor {
    CIMA_JAUNE = 'cima-jaune',
    CIMA_VERTE = 'cima-verte',
    POOLTPV_ROUGE = 'pooltpv-rouge',
    POOLTPV_BLEU = 'pooltpv-bleu',
    POOLTPV_MARRON = 'pooltpv-marron',
    MATCA_BLEU = 'matca-bleu'
}

export enum ChannelType {
    API = 'api',
    WEB = 'web'
}

export enum TransactionType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw'
}

export enum VehicleEnergy {
    DIESEL= 'SEDI',
    ELECTRIC= 'SEEL',
    GASOLINE= 'SEES',
    HYBRID= 'SEHY'
}

/**
 * CATEGORIE DU VEHICULE - Catégories de véhicules
 */
export enum VehicleCategory {
    CATEGORY_1= '01', // Personal vehicles
    CATEGORY_2= '02', // Commercial goods transport
    CATEGORY_3= '03', // Third-party goods transport
    CATEGORY_4= '04', // Taxi vehicles
    CATEGORY_5= '05', // 2-3 wheel vehicles
    CATEGORY_6= '06', // Garage vehicles
    CATEGORY_7= '07', // Driving school vehicles
    CATEGORY_8= '08', // Rental vehicles
    CATEGORY_9= '09', // Construction equipment
    CATEGORY_10= '10', // Special vehicles
    CATEGORY_12= '12', // Corporate personal vehicles
}

/**
 * USAGE DU VEHICULE - Types d'usage du véhicule
 */
export enum VehicleUsage {
    PERSONAL_BUSINESS= 'UV01',
    OWN_TRANSPORT= 'UV02',
    PRIVATE_PASSENGER= 'UV03',
    PUBLIC_GOODS= 'UV04',
    PUBLIC_PASSENGER= 'UV05',
    DRIVING_SCHOOL= 'UV06',
    RENTAL= 'UV07',
    SPECIAL= 'UV08',
    CONSTRUCTION= 'UV09',
    MOTORCYCLE= 'UV10',
}

/**
 * TYPE DU VEHICULE - Types de véhicules
 */
export enum VehicleType {
    AMBULANCE= 'TV01',
    BUS_LARGE= 'TV02',
    HEARSE= 'TV03',
    MINI_BUS= 'TV04',
    TAXI_COMMUNAL= 'TV05',
    TAXI_URBAN= 'TV06',
    DRIVING_SCHOOL= 'TV07',
    PUBLIC_SERVICE= 'TV08',
    TOURISM= 'TV09',
    PERSONAL= 'TV10',
    UTILITY= 'TV11',
    RENTAL= 'TV12',
    MOTORCYCLE= 'TV13',
}

/**
 * GENRE DU VEHICULE - Genre du véhicule
 */
export enum VehicleGenre {
    TRUCK= 'GV01',
    VAN= 'GV02',
    MOTORCYCLE= 'GV03',
    CAR= 'GV04',
    CONSTRUCTION_EQUIPMENT= 'GV05',
    BUS= 'GV06',
    PANEL_VAN= 'GV07',
    TRAILER= 'GV08',
    SCOOTER= 'GV09',
    SEMI_TRAILER= 'GV10',
    AGRICULTURAL_TRACTOR= 'GV11',
    ROAD_TRACTOR= 'GV12',
}

/**
 * TYPE DE SOUSCRIPTEUR - Types de souscripteur
 */
export enum SubscriberType {
    COMMERCIAL_AGENT= 'ST01',
    COLLECTION_AGENT= 'ST02',
    FARMER= 'ST03',
    ARTISAN= 'ST04',
    SPOUSE= 'ST05',
    EMPLOYER= 'ST06',
    RELIGIOUS= 'ST07',
    RETIRED= 'ST08',
    EMPLOYEE= 'ST09',
    UNEMPLOYED= 'ST10',
    SALES_REP= 'ST11',
    OTHER= 'ST12',
}
