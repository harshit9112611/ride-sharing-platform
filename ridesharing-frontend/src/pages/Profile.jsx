import { useEffect, useState } from 'react';
import { Star, Car, Save, Plus, Trash2, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { authApi, vehiclesApi } from '../services/auth';
import { BRANCHES, ACADEMIC_YEARS } from '../utils/constants';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState(null);
  const [savingVehicle, setSavingVehicle] = useState(false);
  const [vehicleForm, setVehicleForm] = useState({
    vehicleType: 'CAR_SEDAN',
    brand: '',
    model: '',
    color: '',
    vehicleNumber: '',
  });

  useEffect(() => {
    Promise.all([authApi.getProfile(), vehiclesApi.getMy()])
      .then(([profileRes, vehiclesRes]) => {
        setProfile(profileRes.data);
        setForm({
          fullName: profileRes.data.fullName,
          phoneNumber: profileRes.data.phoneNumber,
          branch: profileRes.data.branch,
          academicYear: profileRes.data.academicYear,
        });
        setVehicles(vehiclesRes.data);
      })
      .catch(() => toast.error('Failed to load profile data'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await authApi.updateProfile(form);
      setProfile(data);
      updateUser({ ...user, fullName: data.fullName });
      setEditing(false);
      toast.success('Profile updated');
    } catch {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    if (!vehicleForm.brand || !vehicleForm.model || !vehicleForm.vehicleNumber) {
      toast.error('Fill required vehicle fields');
      return;
    }
    setSavingVehicle(true);
    try {
      const { data } = await vehiclesApi.add(vehicleForm);
      setVehicles([...vehicles, data]);
      cancelVehicleForm();
      toast.success('Vehicle added');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add vehicle');
    } finally {
      setSavingVehicle(false);
    }
  };

  const handleUpdateVehicle = async (e) => {
    e.preventDefault();
    if (!vehicleForm.brand || !vehicleForm.model || !vehicleForm.vehicleNumber) {
      toast.error('Fill required vehicle fields');
      return;
    }
    setSavingVehicle(true);
    try {
      const { data } = await vehiclesApi.update(editingVehicleId, vehicleForm);
      setVehicles(vehicles.map((v) => (v.id === editingVehicleId ? data : v)));
      cancelVehicleForm();
      toast.success('Vehicle updated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update vehicle');
    } finally {
      setSavingVehicle(false);
    }
  };

  const handleDeleteVehicle = async (id) => {
    if (!window.confirm('Delete this vehicle?')) return;
    try {
      await vehiclesApi.remove(id);
      setVehicles(vehicles.filter((v) => v.id !== id));
      toast.success('Vehicle removed');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete vehicle');
    }
  };

  const openEditVehicle = (v) => {
    setVehicleForm({
      vehicleType: v.vehicleType || 'CAR_SEDAN',
      brand: v.brand || '',
      model: v.model || '',
      color: v.color || '',
      vehicleNumber: v.vehicleNumber || ''
    });
    setEditingVehicleId(v.id);
    setShowVehicleForm(true);
  };

  const cancelVehicleForm = () => {
    setVehicleForm({ vehicleType: 'CAR_SEDAN', brand: '', model: '', color: '', vehicleNumber: '' });
    setShowVehicleForm(false);
    setEditingVehicleId(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="font-display text-2xl font-bold text-text-primary sm:text-3xl">Profile</h1>
      <p className="mt-1 text-sm text-text-secondary">Manage your account and vehicles</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-6">
          <div className="card p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Personal Info</h2>
              {!editing ? (
                <button type="button" onClick={() => setEditing(true)} className="text-sm font-medium text-accent hover:underline">
                  Edit
                </button>
              ) : (
                <button type="button" onClick={handleSave} disabled={saving} className="btn-accent py-1.5 px-4 text-xs">
                  {saving ? <LoadingSpinner size="sm" className="text-white" /> : <><Save className="h-3.5 w-3.5" /> Save</>}
                </button>
              )}
            </div>

            <div className="mt-6 flex items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-white">
                {profile?.fullName?.charAt(0)}
              </div>
              <div>
                <p className="font-display text-lg font-semibold">{profile?.fullName}</p>
                <p className="text-sm text-text-secondary">{profile?.collegeEmail}</p>
                <p className="mt-1 flex items-center gap-1 text-sm text-text-muted">
                  <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                  {(profile?.rating || 0).toFixed(1)} · {profile?.totalRides || 0} rides
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {editing ? (
                <>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-text-muted">Full Name</label>
                    <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="input-field" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-text-muted">Phone</label>
                    <input value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} className="input-field" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-text-muted">Branch</label>
                    <select value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} className="input-field">
                      {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-text-muted">Year</label>
                    <select value={form.academicYear} onChange={(e) => setForm({ ...form, academicYear: Number(e.target.value) })} className="input-field">
                      {ACADEMIC_YEARS.map((y) => <option key={y.value} value={y.value}>{y.label}</option>)}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <InfoField label="Enrollment" value={profile?.enrollmentNumber} />
                  <InfoField label="Phone" value={profile?.phoneNumber} />
                  <InfoField label="Branch" value={profile?.branch} />
                  <InfoField label="Year" value={`Year ${profile?.academicYear}`} />
                </>
              )}
            </div>
          </div>

          <div className="card p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">My Vehicles</h2>
              <button type="button" onClick={() => showVehicleForm ? cancelVehicleForm() : setShowVehicleForm(true)} className="btn-ghost py-1.5 px-3 text-xs">
                {showVehicleForm ? 'Cancel' : <><Plus className="h-3.5 w-3.5" /> Add</>}
              </button>
            </div>

            {showVehicleForm && (
              <form onSubmit={editingVehicleId ? handleUpdateVehicle : handleAddVehicle} className="mt-4 grid gap-3 rounded-xl border border-border bg-background p-4 sm:grid-cols-2">
                <select value={vehicleForm.vehicleType} onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleType: e.target.value })} className="input-field sm:col-span-2">
                  <option value="BIKE">Bike</option>
                  <option value="SCOOTY">Scooty</option>
                  <option value="CAR_HATCHBACK">Car (Hatchback)</option>
                  <option value="CAR_SEDAN">Car (Sedan)</option>
                  <option value="CAR_SUV">Car (SUV)</option>
                </select>
                <input placeholder="Brand" value={vehicleForm.brand} onChange={(e) => setVehicleForm({ ...vehicleForm, brand: e.target.value })} className="input-field" />
                <input placeholder="Model" value={vehicleForm.model} onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })} className="input-field" />
                <input placeholder="Color" value={vehicleForm.color} onChange={(e) => setVehicleForm({ ...vehicleForm, color: e.target.value })} className="input-field" />
                <input placeholder="Vehicle Number" value={vehicleForm.vehicleNumber} onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleNumber: e.target.value })} className="input-field" />
                <button type="submit" disabled={savingVehicle} className="btn-accent sm:col-span-2">
                  {savingVehicle ? <LoadingSpinner size="sm" className="text-white" /> : (editingVehicleId ? 'Update Vehicle' : 'Save Vehicle')}
                </button>
              </form>
            )}

            <div className="mt-4 space-y-3">
              {vehicles.length === 0 ? (
                <p className="text-sm text-text-muted">No vehicles added yet.</p>
              ) : (
                vehicles.map((v) => (
                  <div key={v.id} className="flex items-center justify-between rounded-xl border border-border p-4">
                    <div className="flex items-center gap-3">
                      <Car className="h-5 w-5 text-accent" />
                      <div>
                        <p className="text-sm font-medium">{v.brand} {v.model}</p>
                        <p className="text-xs text-text-muted">{v.color} · {v.vehicleNumber}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => openEditVehicle(v)} className="text-text-muted hover:text-accent">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => handleDeleteVehicle(v.id)} className="text-text-muted hover:text-error">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card p-6">
            <h2 className="font-display text-lg font-semibold">Ride Statistics</h2>
            <div className="mt-5 space-y-4">
              <StatRow label="Total Rides" value={profile?.totalRides || 0} />
              <StatRow label="Rating" value={(profile?.rating || 0).toFixed(1)} />
              <StatRow label="Verified" value={profile?.verified ? 'Yes' : 'Pending'} />
              <StatRow label="Member Since" value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoField({ label, value }) {
  return (
    <div className="rounded-xl bg-background px-4 py-3">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-text-primary">{value}</p>
    </div>
  );
}

function StatRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className="text-sm font-semibold text-text-primary">{value}</span>
    </div>
  );
}
