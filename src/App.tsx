import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { DonorPortal } from './components/DonorPortal';
import { NgoDashboard } from './components/NgoDashboard';
import { VolunteerDispatch } from './components/VolunteerDispatch';
import { ComplianceCenter } from './components/ComplianceCenter';
import { ImpactAnalytics } from './components/ImpactAnalytics';
import { TransitTrackerModal } from './components/TransitTrackerModal';
import {
  INITIAL_DONATIONS,
  INITIAL_NGOS,
  INITIAL_VOLUNTEERS,
  INITIAL_NOTIFICATIONS,
} from './data/mockData';
import {
  FoodDonation,
  VerifiedNgo,
  VolunteerCourier,
  VolunteerNotification,
} from './types/foodRescue';

export default function App() {
  const [currentRole, setCurrentRole] = useState<
    'donor' | 'ngo' | 'volunteer' | 'compliance' | 'impact'
  >('donor');

  const [donations, setDonations] = useState<FoodDonation[]>(INITIAL_DONATIONS);
  const [ngos] = useState<VerifiedNgo[]>(INITIAL_NGOS);
  const [volunteers, setVolunteers] = useState<VolunteerCourier[]>(INITIAL_VOLUNTEERS);
  const [notifications, setNotifications] = useState<VolunteerNotification[]>(INITIAL_NOTIFICATIONS);

  const [activeNgoId, setActiveNgoId] = useState<string>(INITIAL_NGOS[0].id);
  const [activeVolunteerId, setActiveVolunteerId] = useState<string>(INITIAL_VOLUNTEERS[0].id);

  // Modal for live GPS & temperature telemetry tracking
  const [trackerDonation, setTrackerDonation] = useState<FoodDonation | null>(null);

  // Stats
  const totalMealsRescued = donations.reduce((acc, curr) => acc + curr.totalServings, 0);
  const activeRescueCount = donations.filter((d) => d.status === 'in_transit').length;

  // Add new donation from Donor Portal
  const handleAddDonation = (newDonation: FoodDonation) => {
    setDonations((prev) => [newDonation, ...prev]);

    // Dispatch a volunteer alert notification
    const newNotif: VolunteerNotification = {
      id: `notif-${Date.now()}`,
      donationId: newDonation.id,
      title: `New Food Rescue Alert: ${newDonation.totalServings} Meals Available`,
      donorName: `${newDonation.donorName} (${newDonation.donorAddress.slice(0, 24)}...)`,
      servings: newDonation.totalServings,
      distanceKm: Number((1.1 + Math.random() * 2).toFixed(1)),
      pickupWindow: 'Ready for immediate pickup',
      foodType: newDonation.items.map((i) => i.name).join(', '),
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // NGO Claims Donation
  const handleClaimDonation = (donationId: string, ngoId: string) => {
    const targetNgo = ngos.find((n) => n.id === ngoId) || ngos[0];

    setDonations((prev) =>
      prev.map((d) => {
        if (d.id !== donationId) return d;
        return {
          ...d,
          status: 'claimed',
          claimedByNgoId: targetNgo.id,
          claimedByNgoName: targetNgo.name,
          deliveryLocation: {
            address: targetNgo.address,
            lat: targetNgo.location.lat,
            lng: targetNgo.location.lng,
            ngoName: targetNgo.name,
          },
        };
      })
    );

    // Notify volunteers that this claimed donation is dispatch ready
    const targetDonation = donations.find((d) => d.id === donationId);
    if (targetDonation) {
      const claimNotif: VolunteerNotification = {
        id: `notif-${Date.now()}`,
        donationId: targetDonation.id,
        title: `Dispatch Ready: ${targetDonation.title}`,
        donorName: `To be delivered to ${targetNgo.name}`,
        servings: targetDonation.totalServings,
        distanceKm: 1.8,
        pickupWindow: 'Within 90 mins',
        foodType: targetDonation.items.map((i) => i.name).join(', '),
        timestamp: new Date().toISOString(),
        read: false,
      };
      setNotifications((prev) => [claimNotif, ...prev]);
    }
  };

  // Volunteer accepts mission
  const handleAcceptMission = (donationId: string, volunteerId: string) => {
    const vol = volunteers.find((v) => v.id === volunteerId) || volunteers[0];

    setDonations((prev) =>
      prev.map((d) => {
        if (d.id !== donationId) return d;
        return {
          ...d,
          status: 'volunteer_assigned',
          volunteerId: vol.id,
          volunteerName: vol.name,
          volunteerPhone: vol.phone,
          volunteerVehicle: `${vol.vehicleType.replace('_', ' ').toUpperCase()} (Courier #${vol.id})`,
        };
      })
    );

    setVolunteers((prev) =>
      prev.map((v) => (v.id === volunteerId ? { ...v, activeStatus: 'on_mission' } : v))
    );
  };

  // Update mission status (step by step)
  const handleUpdateMissionStatus = (
    donationId: string,
    newStatus: any,
    updates?: Partial<FoodDonation>
  ) => {
    setDonations((prev) =>
      prev.map((d) => {
        if (d.id !== donationId) return d;
        const updated = {
          ...d,
          status: newStatus,
          ...updates,
        };
        // Update modal reference if currently open
        if (trackerDonation && trackerDonation.id === donationId) {
          setTrackerDonation(updated);
        }
        return updated;
      })
    );

    if (newStatus === 'delivered') {
      // Free volunteer
      const target = donations.find((d) => d.id === donationId);
      if (target?.volunteerId) {
        setVolunteers((prev) =>
          prev.map((v) =>
            v.id === target.volunteerId
              ? { ...v, activeStatus: 'available', completedMissions: v.completedMissions + 1 }
              : v
          )
        );
      }
    }
  };

  // NGO confirms delivery receipt
  const handleConfirmDeliveryFromNgo = (donationId: string, recipientDetails: string) => {
    const target = donations.find((d) => d.id === donationId);
    handleUpdateMissionStatus(donationId, 'delivered', {
      distributionReport: {
        deliveredAt: new Date().toISOString(),
        receivedByNgoRep: target?.claimedByNgoName || 'Verified NGO Food Director',
        targetRecipients: recipientDetails,
        mealsServed: target?.totalServings || 0,
        photosVerified: true,
        digitalSignature: `Authorized & Inspected by ${target?.claimedByNgoName}`,
      },
    });
  };

  const handleMarkNotificationRead = (notifId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
  };

  const handleSelectDonationFromNotification = (donationId: string) => {
    const target = donations.find((d) => d.id === donationId);
    if (target) {
      if (target.status === 'in_transit') {
        setTrackerDonation(target);
      } else if (target.status === 'available') {
        setCurrentRole('ngo');
      } else {
        setCurrentRole('volunteer');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Global Navigation with Role Switcher */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onSelectDonationFromNotification={handleSelectDonationFromNotification}
        activeRescueCount={activeRescueCount}
        totalMealsRescued={totalMealsRescued}
      />

      {/* Main Role Content */}
      <main className="flex-1">
        {currentRole === 'donor' && (
          <DonorPortal
            donations={donations}
            onAddDonation={handleAddDonation}
            onOpenTracker={(d) => setTrackerDonation(d)}
          />
        )}

        {currentRole === 'ngo' && (
          <NgoDashboard
            ngos={ngos}
            activeNgoId={activeNgoId}
            onSelectNgo={setActiveNgoId}
            donations={donations}
            onClaimDonation={handleClaimDonation}
            onConfirmDelivery={handleConfirmDeliveryFromNgo}
            onOpenTracker={(d) => setTrackerDonation(d)}
          />
        )}

        {currentRole === 'volunteer' && (
          <VolunteerDispatch
            volunteers={volunteers}
            activeVolunteerId={activeVolunteerId}
            onSelectVolunteer={setActiveVolunteerId}
            donations={donations}
            onAcceptMission={handleAcceptMission}
            onUpdateMissionStatus={handleUpdateMissionStatus}
            onOpenTracker={(d) => setTrackerDonation(d)}
          />
        )}

        {currentRole === 'compliance' && (
          <ComplianceCenter
            donations={donations}
            onOpenTracker={(d) => setTrackerDonation(d)}
          />
        )}

        {currentRole === 'impact' && (
          <ImpactAnalytics
            donations={donations}
            ngos={ngos}
            volunteers={volunteers}
          />
        )}
      </main>

      {/* Live Transit & Temperature Quality Tracker Modal */}
      {trackerDonation && (
        <TransitTrackerModal
          donation={trackerDonation}
          onClose={() => setTrackerDonation(null)}
          onConfirmDelivery={(id) => {
            handleUpdateMissionStatus(id, 'delivered');
            setTrackerDonation(null);
          }}
          userRole={currentRole}
        />
      )}

      {/* Global Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950 text-slate-400 py-6 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} NourishLoop Food Rescue Network. Safe Samaritan Compliant.</p>
          <div className="flex items-center gap-4">
            <span className="text-emerald-400 font-semibold">100% Non-Profit Food Rescue Infrastructure</span>
            <span>•</span>
            <span>FDA Food Code & HACCP Calibrated</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
