"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { BookingStatusBadge } from "@/components/booking/BookingStatusBadge";
import type { Booking, Driver, BookingStatus, ServiceType } from "@/types/database.types";
import { formatCurrency } from "@/lib/utils";

export function DispatchQueueTable({
  initialBookings,
  drivers,
}: {
  initialBookings: any[];
  drivers: Driver[];
}) {
  const [bookings, setBookings] = useState(initialBookings);
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const router = useRouter();

  const filteredBookings = bookings.filter((b) => {
    if (serviceFilter !== "all" && b.service_type !== serviceFilter) return false;
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    return true;
  });

  async function handleAssignDriver(bookingId: string, driverId: string) {
    if (!driverId) return;
    setLoadingId(bookingId);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/assign-driver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to assign driver.");
      router.refresh();
      setMsg("Driver assigned successfully.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error assigning driver");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleUpdateStatus(bookingId: string, status: BookingStatus) {
    setLoadingId(bookingId);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update status.");
      router.refresh();
      setMsg(`Status updated to ${status}.`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error updating status");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleSendPaymentLink(bookingId: string) {
    setLoadingId(bookingId);
    try {
      const res = await fetch(`/api/payments/${bookingId}/link`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send payment link.");
      alert(`Razorpay Payment Link generated & sent:\n${data.link_url}`);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error generating payment link");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleLogManualPayment(bookingId: string) {
    const ref = prompt("Enter Cash or UPI Payment reference code:");
    if (!ref) return;

    setLoadingId(bookingId);
    try {
      const res = await fetch(`/api/payments/${bookingId}/manual`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: "cash", reference: ref }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to log manual payment.");
      alert("Manual payment recorded as PAID.");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error logging payment");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {msg && (
        <div className="rounded-stub bg-route/10 border border-route p-3 text-sm text-route font-medium">
          {msg}
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-stub border border-line bg-white p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="mr-2 text-xs font-mono text-ink/60 uppercase">Service:</label>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="rounded-stub border border-line bg-paper px-2.5 py-1 text-sm text-ink focus:outline-none"
            >
              <option value="all">All Services</option>
              <option value="local">Local</option>
              <option value="outstation">Outstation</option>
              <option value="sightseeing">Sightseeing</option>
              <option value="hourly">Hourly Rental</option>
            </select>
          </div>

          <div>
            <label className="mr-2 text-xs font-mono text-ink/60 uppercase">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-stub border border-line bg-paper px-2.5 py-1 text-sm text-ink focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="requested">Requested</option>
              <option value="confirmed">Confirmed</option>
              <option value="driver_assigned">Driver Assigned</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <span className="font-mono text-xs text-ink/50">
          Showing {filteredBookings.length} of {bookings.length} bookings
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-stub border border-line bg-white shadow-sm">
        <table className="w-full text-left text-sm text-ink">
          <thead className="bg-paper font-mono text-xs uppercase text-ink/60 border-b border-line">
            <tr>
              <th className="px-4 py-3">Booking ID & Date</th>
              <th className="px-4 py-3">Service & Route</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Fare</th>
              <th className="px-4 py-3">Assigned Driver</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/60">
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink/50 font-mono">
                  No bookings found matching filters.
                </td>
              </tr>
            ) : (
              filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-paper/40 transition">
                  <td className="px-4 py-3">
                    <p className="font-mono font-bold text-xs">
                      #{b.id.substring(0, 8)}
                    </p>
                    <p className="text-xs text-ink/60">
                      {new Date(b.scheduled_at).toLocaleString()}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-bold uppercase bg-paper px-2 py-0.5 rounded text-ink/80">
                      {b.service_type}
                    </span>
                    <p className="mt-1 text-xs text-ink/70">
                      {b.pickup_location} {b.drop_location ? `→ ${b.drop_location}` : ""}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <BookingStatusBadge status={b.status} />
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-route">
                    {formatCurrency(b.fare_amount)}
                  </td>
                  <td className="px-4 py-3">
                    {b.is_self_drive ? (
                      <span className="font-mono text-xs font-bold uppercase bg-marigold/30 text-ink px-2.5 py-1 rounded inline-block">
                        ⚡ Self-Drive (Customer Pickup)
                      </span>
                    ) : (
                      <>
                        <select
                          value={b.driver_id || ""}
                          onChange={(e) => handleAssignDriver(b.id, e.target.value)}
                          disabled={loadingId === b.id}
                          className="rounded-stub border border-line bg-paper px-2 py-1 text-xs text-ink focus:outline-none"
                        >
                          <option value="">-- Assign Driver --</option>
                          {drivers.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name} ({d.vehicle_number})
                            </option>
                          ))}
                        </select>
                        {b.drivers && (
                          <p className="mt-1 text-[11px] text-ink/60 font-mono">
                            📞 {b.drivers.phone}
                          </p>
                        )}
                      </>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right space-y-1">
                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                      {b.status === "requested" && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleUpdateStatus(b.id, "confirmed")}
                        >
                          Confirm
                        </Button>
                      )}
                      {b.status === "driver_assigned" && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleUpdateStatus(b.id, "ongoing")}
                        >
                          Start Ride
                        </Button>
                      )}
                      {b.status === "ongoing" && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(b.id, "completed")}
                        >
                          Complete
                        </Button>
                      )}
                      {b.status === "completed" && (
                        <>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleSendPaymentLink(b.id)}
                          >
                            Send Pay Link
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleLogManualPayment(b.id)}
                          >
                            Log Cash/UPI
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
