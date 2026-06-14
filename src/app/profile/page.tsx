"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, User, Heart, Pill, X, Edit2, Trash2, Pause, Play, Clock, Calendar, FileText } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAppState } from "@/lib/app-context";
import { useAuth } from "@/lib/auth";
import { fetchProfile, upsertProfile } from "@/lib/profile";
import type { Profile } from "@/lib/types/database";

const conditionOptions = [
  "Diabetes Type 2",
  "Hypertension",
  "Heart Disease",
  "Asthma",
  "Arthritis",
  "Depression",
  "Anxiety",
  "Thyroid Disorder",
  "None",
];

export default function ProfilePage() {
  const { medications, addMedication, updateMedication, deleteMedication, pauseMedication, resumeMedication, profile: localProfile, updateProfile } = useAppState();
  const { user } = useAuth();
  const [supabaseProfile, setSupabaseProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [editingMedicationId, setEditingMedicationId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [tempProfile, setTempProfile] = useState(localProfile);
  const profileFetchedRef = useRef(false);

  useEffect(() => {
    if (!user || profileFetchedRef.current) return;
    profileFetchedRef.current = true;

    fetchProfile(user.id).then((profile) => {
      if (profile) {
        setSupabaseProfile(profile);
        setTempProfile((prev) => {
          const hasEdits = prev.name !== localProfile.name || prev.age !== localProfile.age;
          if (hasEdits) return prev;
          return {
            ...localProfile,
            name: profile.name || localProfile.name,
            age: profile.age || localProfile.age,
            gender: profile.gender || localProfile.gender,
            height: profile.height || localProfile.height,
            weight: profile.weight || localProfile.weight,
          };
        });
      }
    });
  }, [user, localProfile]);

  const [newMed, setNewMed] = useState({
    name: "",
    dosage: "",
    schedule: "",
    frequency: "daily" as "daily" | "twice_daily" | "weekly" | "as_needed",
    instructions: "",
  });

  const [editMed, setEditMed] = useState({
    name: "",
    dosage: "",
    schedule: "",
    frequency: "daily" as "daily" | "twice_daily" | "weekly" | "as_needed",
    instructions: "",
    notes: "",
  });

  const handleSaveProfile = () => {
    const updatedProfile = {
      name: tempProfile.name,
      age: tempProfile.age,
      gender: tempProfile.gender,
      height: tempProfile.height,
      weight: tempProfile.weight,
    };
    updateProfile(updatedProfile);
    setIsEditing(false);

    if (user) {
      upsertProfile({
        id: user.id,
        email: user.email || "",
        name: tempProfile.name,
        age: tempProfile.age,
        gender: tempProfile.gender,
        height: tempProfile.height,
        weight: tempProfile.weight,
        created_at: supabaseProfile?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  };

  const handleCancelEdit = () => {
    setTempProfile(localProfile);
    setIsEditing(false);
  };

  const handleAddMedication = () => {
    if (newMed.name.trim() && newMed.dosage.trim() && newMed.schedule.trim()) {
      addMedication({
        name: newMed.name.trim(),
        dosage: newMed.dosage.trim(),
        schedule: newMed.schedule.trim(),
        frequency: newMed.frequency,
        instructions: newMed.instructions.trim() || undefined,
        status: "active",
        startDate: new Date(),
      });
      setNewMed({ name: "", dosage: "", schedule: "", frequency: "daily", instructions: "" });
      setShowAddMedication(false);
    }
  };

  const handleEditMedication = (med: typeof medications[0]) => {
    setEditMed({
      name: med.name,
      dosage: med.dosage,
      schedule: med.schedule,
      frequency: med.frequency,
      instructions: med.instructions || "",
      notes: med.notes || "",
    });
    setEditingMedicationId(med.id);
  };

  const handleSaveEdit = () => {
    if (editingMedicationId && editMed.name.trim() && editMed.dosage.trim() && editMed.schedule.trim()) {
      updateMedication(editingMedicationId, {
        name: editMed.name.trim(),
        dosage: editMed.dosage.trim(),
        schedule: editMed.schedule.trim(),
        frequency: editMed.frequency,
        instructions: editMed.instructions.trim() || undefined,
        notes: editMed.notes.trim() || undefined,
      });
      setEditingMedicationId(null);
      setEditMed({ name: "", dosage: "", schedule: "", frequency: "daily", instructions: "", notes: "" });
    }
  };

  const handleDeleteMedication = (id: string) => {
    deleteMedication(id);
    setShowDeleteConfirm(null);
  };

  const getStatusColor = (status: string) => {
    if (status === "active") return "bg-medication/10 text-medication border-medication/30";
    if (status === "paused") return "bg-stress/10 text-stress border-stress/30";
    return "bg-muted text-muted-foreground border-border";
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-card border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/" className="p-2 rounded-lg hover:bg-surface transition-colors">
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              </Link>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">Profile</h1>
                <p className="text-xs text-muted-foreground">Personal health context</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (isEditing) {
                  handleSaveProfile();
                } else {
                  setTempProfile(localProfile);
                }
                setIsEditing(!isEditing);
              }}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                isEditing
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface hover:bg-surface-hover text-foreground"
              )}
            >
              {isEditing ? "Save" : "Edit"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="glass-card rounded-2xl p-6 mb-5">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">{localProfile.name}</h2>
              <p className="text-sm text-muted-foreground">Used to personalize AI insights</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Age</label>
              {isEditing ? (
                <input
                  type="number"
                  value={tempProfile.age}
                  onChange={(e) => setTempProfile({ ...tempProfile, age: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              ) : (
                <p className="text-foreground font-medium">{localProfile.age} years</p>
              )}
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Gender</label>
              {isEditing ? (
                <select
                  value={tempProfile.gender}
                  onChange={(e) => setTempProfile({ ...tempProfile, gender: e.target.value })}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Prefer not to say</option>
                </select>
              ) : (
                <p className="text-foreground font-medium">{localProfile.gender}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Height</label>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={tempProfile.height}
                    onChange={(e) => setTempProfile({ ...tempProfile, height: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <span className="text-sm text-muted-foreground">cm</span>
                </div>
              ) : (
                <p className="text-foreground font-medium">{localProfile.height} cm</p>
              )}
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Weight</label>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={tempProfile.weight}
                    onChange={(e) => setTempProfile({ ...tempProfile, weight: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <span className="text-sm text-muted-foreground">kg</span>
                </div>
              ) : (
                <p className="text-foreground font-medium">{localProfile.weight} kg</p>
              )}
            </div>
          </div>

          {isEditing && (
            <button
              onClick={handleCancelEdit}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          )}
        </div>

        <div className="glass-card rounded-2xl p-6 mb-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <Heart className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Existing Conditions</h3>
              <p className="text-xs text-muted-foreground">Help us personalize your experience</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-3">Coming soon - add custom conditions</p>
          <div className="flex flex-wrap gap-2">
            {conditionOptions.slice(0, -1).map((condition) => (
              <span
                key={condition}
                className="px-3 py-1.5 rounded-full border-2 border-border text-sm font-medium text-muted-foreground bg-surface"
              >
                {condition}
              </span>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Pill className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Medications</h3>
                <p className="text-xs text-muted-foreground">Manage your medication list</p>
              </div>
            </div>
            {isEditing && (
              <button
                onClick={() => setShowAddMedication(true)}
                className="text-xs text-secondary hover:text-secondary/80 transition-colors"
              >
                + Add
              </button>
            )}
          </div>

          <div className="space-y-3">
            {medications.map((med) => (
              <div
                key={med.id}
                className="p-4 bg-surface rounded-xl border border-border"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{med.name}</p>
                    <p className="text-xs text-muted-foreground">{med.dosage}</p>
                  </div>
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full border",
                    getStatusColor(med.status)
                  )}>
                    {med.status === "active" ? "Active" : med.status === "paused" ? "Paused" : "Stopped"}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {med.schedule}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {med.frequency.replace("_", " ")}
                  </span>
                  <span className="text-medication font-medium">{med.compliance}% adherence</span>
                </div>

                {med.instructions && (
                  <div className="flex items-start gap-1.5 text-xs text-muted-foreground mb-3">
                    <FileText className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>{med.instructions}</span>
                  </div>
                )}

                {med.notes && (
                  <div className="text-xs text-muted-foreground mb-3 italic">
                    Note: {med.notes}
                  </div>
                )}

                {isEditing && (
                  <div className="flex items-center gap-2 pt-2 border-t border-border">
                    <button
                      onClick={() => handleEditMedication(med)}
                      className="flex items-center gap-1 text-xs text-secondary hover:text-secondary/80 transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit
                    </button>
                    {med.status === "active" ? (
                      <button
                        onClick={() => pauseMedication(med.id)}
                        className="flex items-center gap-1 text-xs text-stress hover:text-stress/80 transition-colors"
                      >
                        <Pause className="w-3 h-3" />
                        Pause
                      </button>
                    ) : (
                      <button
                        onClick={() => resumeMedication(med.id)}
                        className="flex items-center gap-1 text-xs text-medication hover:text-medication/80 transition-colors"
                      >
                        <Play className="w-3 h-3" />
                        Resume
                      </button>
                    )}
                    <button
                      onClick={() => setShowDeleteConfirm(med.id)}
                      className="flex items-center gap-1 text-xs text-risk hover:text-risk/80 transition-colors ml-auto"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}

            {medications.length === 0 && (
              <div className="text-center py-6 text-sm text-muted-foreground">
                No medications added yet. Click Edit to add your first medication.
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-6">
          This information is used to personalize AI insights and risk detection.
          <br />
          All data is stored locally and never shared.
        </p>
      </main>

      {showAddMedication && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-border flex items-center justify-between sticky top-0 bg-background">
              <h2 className="text-lg font-semibold text-foreground">Add Medication</h2>
              <button onClick={() => setShowAddMedication(false)} className="p-2 rounded-lg hover:bg-surface transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Medication Name *</label>
                <input
                  type="text"
                  value={newMed.name}
                  onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                  placeholder="e.g., Vitamin D3"
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Dosage *</label>
                <input
                  type="text"
                  value={newMed.dosage}
                  onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                  placeholder="e.g., 5000 IU"
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Schedule *</label>
                <input
                  type="text"
                  value={newMed.schedule}
                  onChange={(e) => setNewMed({ ...newMed, schedule: e.target.value })}
                  placeholder="e.g., 8:00 AM"
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Frequency</label>
                <select
                  value={newMed.frequency}
                  onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value as typeof newMed.frequency })}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="daily">Daily</option>
                  <option value="twice_daily">Twice Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="as_needed">As Needed</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Instructions</label>
                <input
                  type="text"
                  value={newMed.instructions}
                  onChange={(e) => setNewMed({ ...newMed, instructions: e.target.value })}
                  placeholder="e.g., Take with food"
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowAddMedication(false)}
                  className="flex-1 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMedication}
                  disabled={!newMed.name.trim() || !newMed.dosage.trim() || !newMed.schedule.trim()}
                  className="flex-1 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  Add Medication
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingMedicationId && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-border flex items-center justify-between sticky top-0 bg-background">
              <h2 className="text-lg font-semibold text-foreground">Edit Medication</h2>
              <button onClick={() => setEditingMedicationId(null)} className="p-2 rounded-lg hover:bg-surface transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Medication Name *</label>
                <input
                  type="text"
                  value={editMed.name}
                  onChange={(e) => setEditMed({ ...editMed, name: e.target.value })}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Dosage *</label>
                <input
                  type="text"
                  value={editMed.dosage}
                  onChange={(e) => setEditMed({ ...editMed, dosage: e.target.value })}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Schedule *</label>
                <input
                  type="text"
                  value={editMed.schedule}
                  onChange={(e) => setEditMed({ ...editMed, schedule: e.target.value })}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Frequency</label>
                <select
                  value={editMed.frequency}
                  onChange={(e) => setEditMed({ ...editMed, frequency: e.target.value as typeof editMed.frequency })}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="daily">Daily</option>
                  <option value="twice_daily">Twice Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="as_needed">As Needed</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Instructions</label>
                <input
                  type="text"
                  value={editMed.instructions}
                  onChange={(e) => setEditMed({ ...editMed, instructions: e.target.value })}
                  placeholder="e.g., Take with food"
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Notes</label>
                <input
                  type="text"
                  value={editMed.notes}
                  onChange={(e) => setEditMed({ ...editMed, notes: e.target.value })}
                  placeholder="Optional notes"
                  className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setEditingMedicationId(null)}
                  className="flex-1 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={!editMed.name.trim() || !editMed.dosage.trim() || !editMed.schedule.trim()}
                  className="flex-1 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-background border border-border rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Delete Medication?</h2>
            </div>
            <div className="p-5">
              <p className="text-sm text-muted-foreground mb-4">
                Are you sure you want to delete this medication? This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteMedication(showDeleteConfirm)}
                  className="flex-1 py-2 text-sm font-medium bg-risk text-white rounded-lg hover:bg-risk/90 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}