export type FoodCategory =
  | 'cooked_hot'
  | 'cooked_cold'
  | 'bakery'
  | 'fresh_produce'
  | 'packaged_dry'
  | 'dairy';

export type DonorType =
  | 'restaurant'
  | 'event_caterer'
  | 'banquet_hall'
  | 'supermarket'
  | 'household';

export type StorageRequirement = 'hot_insulated' | 'cold_refrigerated' | 'ambient';

export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  quantityKg: number;
  estimatedServings: number;
  allergens: string[];
  dietaryTags: ('vegetarian' | 'vegan' | 'halal' | 'kosher' | 'gluten_free' | 'dairy_free')[];
  storageReq: StorageRequirement;
}

export type DonationStatus =
  | 'available'
  | 'claimed'
  | 'volunteer_assigned'
  | 'in_transit'
  | 'delivered'
  | 'cancelled';

export interface TransitTelemetryPoint {
  timestamp: string;
  tempCelsius: number;
  lat: number;
  lng: number;
}

export interface TransitTelemetry {
  currentLat: number;
  currentLng: number;
  currentTempCelsius: number;
  speedKmh: number;
  etaMinutes: number;
  tempStatus: 'optimal' | 'warning' | 'critical';
  history: TransitTelemetryPoint[];
}

export interface QualityInspection {
  inspectorName: string;
  inspectorRole: 'volunteer' | 'ngo_officer';
  timestamp: string;
  visualCheckPassed: boolean;
  odorCheckPassed: boolean;
  packagingSealed: boolean;
  measuredTempCelsius: number;
  notes: string;
  complianceVerdict: 'APPROVED_FOR_DISTRIBUTION' | 'REJECTED_UNSAFE';
  certId: string;
}

export interface DistributionReport {
  deliveredAt: string;
  receivedByNgoRep: string;
  targetRecipients: string;
  mealsServed: number;
  photosVerified: boolean;
  digitalSignature: string;
}

export interface FoodDonation {
  id: string;
  donorId: string;
  donorName: string;
  donorType: DonorType;
  donorAddress: string;
  donorPhone: string;
  donorLocation: { lat: number; lng: number };
  title: string;
  description: string;
  items: FoodItem[];
  totalKg: number;
  totalServings: number;
  preparedAt: string; // ISO
  expiryTime: string; // ISO
  packagingType:
    | 'sealed_food_grade_containers'
    | 'insulated_cambros'
    | 'aluminum_foil_trays'
    | 'vacuum_sealed';
  temperatureAtPackCelsius: number;
  safetyDeclarationSigned: boolean;
  status: DonationStatus;
  claimedByNgoId?: string;
  claimedByNgoName?: string;
  volunteerId?: string;
  volunteerName?: string;
  volunteerPhone?: string;
  volunteerVehicle?: string;
  pickupWindowStart: string;
  pickupWindowEnd: string;
  deliveryLocation?: {
    address: string;
    lat: number;
    lng: number;
    ngoName: string;
  };
  transitTelemetry?: TransitTelemetry;
  qualityInspection?: QualityInspection;
  distributionReport?: DistributionReport;
  createdAt: string;
}

export interface VerifiedNgo {
  id: string;
  name: string;
  registrationNumber: string;
  verifiedStatus: 'verified_active' | 'pending_audit';
  address: string;
  contactPerson: string;
  phone: string;
  email: string;
  capacityPerDay: number;
  facilities: string[];
  location: { lat: number; lng: number };
}

export interface VolunteerCourier {
  id: string;
  name: string;
  phone: string;
  vehicleType: 'refrigerated_van' | 'insulated_bike' | 'cargo_ev' | 'car';
  activeStatus: 'available' | 'on_mission' | 'offline';
  completedMissions: number;
  safetyTrainingCertified: boolean;
  rating: number;
  currentLocation: { lat: number; lng: number };
}

export interface VolunteerNotification {
  id: string;
  donationId: string;
  title: string;
  donorName: string;
  servings: number;
  distanceKm: number;
  pickupWindow: string;
  foodType: string;
  timestamp: string;
  read: boolean;
}
