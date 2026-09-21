import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  Search,
  ChevronDown,
  RotateCw,
  Clock,
  User,
  MapPin,
  Phone,
  MoreHorizontal,
  Check,
  CheckCircle2,
  ArrowRight,
  Navigation,
  Wrench,
  DollarSign,
  X,
  ExternalLink,
  Send,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { Job, JobStatus, Technician } from '../../types';

interface FocusedJob {
  id: string;
  jobNumber: string;
  customerName: string;
  location: string;
  serviceCategory: string;
  startTime: string;
  endTime: string;
  technicianName: string;
  technicianAvatar?: string;
  status: 'scheduled' | 'en_route' | 'on_site' | 'in_progress' | 'completed';
  mpesaStatus: 'paid' | 'pending';
  mpesaAmount?: number;
  customerPhone: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'emergency';
}

interface LiveTechCard {
  id: string;
  name: string;
  role: string;
  location: string;
  activeJob: string;
  activeStatus: string;
  gpsSignal: 'Strong' | 'Good' | 'Offline';
  avatarUrl: string;
}

export const DispatchView: React.FC = () => {
  const { showToast, setActiveTab } = useApp();

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState('All Services');
  const [selectedTechFilter, setSelectedTechFilter] = useState('All Technicians');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Column expanded states for "+ X more jobs"
  const [expandedColumns, setExpandedColumns] = useState<Record<string, boolean>>({
    scheduled: false,
    en_route: false,
    on_site: false,
    in_progress: false,
    completed: false,
  });

  // Drag and drop state
  const [draggedJobId, setDraggedJobId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Job details modal/drawer state
  const [inspectJob, setInspectJob] = useState<FocusedJob | null>(null);
  const [activeMenuJobId, setActiveMenuJobId] = useState<string | null>(null);
  const [stkPushInProgress, setStkPushInProgress] = useState(false);

  // Seeded jobs matching KDBRi.jpg and application dataset
  const [jobList, setJobList] = useState<FocusedJob[]>([
    // Scheduled (12 total: 3 visible + 9 more jobs)
    {
      id: 'job-1048',
      jobNumber: 'JOB-1048',
      customerName: 'John Mwangi',
      location: 'Westlands, Nairobi',
      serviceCategory: 'HVAC Services',
      startTime: '08:00',
      endTime: '10:00',
      technicianName: 'Peter Njuguna',
      technicianAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      status: 'scheduled',
      mpesaStatus: 'paid',
      mpesaAmount: 12500,
      customerPhone: '+254 712 345 678',
      title: 'VRF Commercial Air Conditioning Seasonal Maintenance',
      priority: 'medium',
    },
    {
      id: 'job-1051',
      jobNumber: 'JOB-1051',
      customerName: 'Amina Sheikh',
      location: 'Kilimani, Nairobi',
      serviceCategory: 'Plumbing Services',
      startTime: '09:30',
      endTime: '11:30',
      technicianName: 'Brian Otieno',
      technicianAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      status: 'scheduled',
      mpesaStatus: 'pending',
      mpesaAmount: 8400,
      customerPhone: '+254 722 890 123',
      title: 'Commercial Booster Pump Pressure Valve Replacement',
      priority: 'high',
    },
    {
      id: 'job-1054',
      jobNumber: 'JOB-1054',
      customerName: 'David Kamau',
      location: "Lang'ata, Nairobi",
      serviceCategory: 'Electrical Services',
      startTime: '11:00',
      endTime: '13:00',
      technicianName: 'Martin Wanjohi',
      technicianAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
      status: 'scheduled',
      mpesaStatus: 'pending',
      mpesaAmount: 14200,
      customerPhone: '+254 733 456 789',
      title: 'Distribution Board Phase Imbalance Rectification',
      priority: 'medium',
    },
    {
      id: 'job-1055',
      jobNumber: 'JOB-1055',
      customerName: 'Faith Wambui',
      location: 'Runda, Nairobi',
      serviceCategory: 'HVAC Services',
      startTime: '12:00',
      endTime: '14:00',
      technicianName: 'Peter Njuguna',
      status: 'scheduled',
      mpesaStatus: 'paid',
      mpesaAmount: 18000,
      customerPhone: '+254 721 112 233',
      title: 'Multi-Split AC Unit Filter Cleaning & Inverter Check',
      priority: 'low',
    },
    {
      id: 'job-1056',
      jobNumber: 'JOB-1056',
      customerName: 'Kipchoge Keino',
      location: 'Karen, Nairobi',
      serviceCategory: 'Generator Systems',
      startTime: '13:30',
      endTime: '15:30',
      technicianName: 'James Ndung\'u',
      status: 'scheduled',
      mpesaStatus: 'pending',
      mpesaAmount: 25000,
      customerPhone: '+254 720 998 877',
      title: '50kVA Standby Diesel Generator 250-Hour Service',
      priority: 'medium',
    },
    {
      id: 'job-1057',
      jobNumber: 'JOB-1057',
      customerName: 'Zainab Omar',
      location: 'Lavington, Nairobi',
      serviceCategory: 'Plumbing Services',
      startTime: '14:00',
      endTime: '16:00',
      technicianName: 'Samuel Njoroge',
      status: 'scheduled',
      mpesaStatus: 'pending',
      mpesaAmount: 6500,
      customerPhone: '+254 711 554 433',
      title: 'Solar Water Heating Thermostat Diagnosis',
      priority: 'low',
    },
    {
      id: 'job-1058',
      jobNumber: 'JOB-1058',
      customerName: 'Timothy Mutua',
      location: 'Kileleshwa, Nairobi',
      serviceCategory: 'Electrical Services',
      startTime: '14:30',
      endTime: '16:30',
      technicianName: 'Alex Muli',
      status: 'scheduled',
      mpesaStatus: 'paid',
      mpesaAmount: 9800,
      customerPhone: '+254 723 667 788',
      title: 'Automatic Transfer Switch (ATS) Contact Replacement',
      priority: 'medium',
    },
    {
      id: 'job-1059',
      jobNumber: 'JOB-1059',
      customerName: 'Lucy Wangari',
      location: 'Parklands, Nairobi',
      serviceCategory: 'Commercial Kitchen',
      startTime: '15:00',
      endTime: '17:00',
      technicianName: 'Paul Kibe',
      status: 'scheduled',
      mpesaStatus: 'pending',
      mpesaAmount: 11000,
      customerPhone: '+254 714 889 900',
      title: 'Commercial Steam Oven Descaling & Element Inspection',
      priority: 'low',
    },
    {
      id: 'job-1060',
      jobNumber: 'JOB-1060',
      customerName: 'Ahmed Noor',
      location: 'South C, Nairobi',
      serviceCategory: 'HVAC Services',
      startTime: '15:30',
      endTime: '17:30',
      technicianName: 'Peter Njuguna',
      status: 'scheduled',
      mpesaStatus: 'pending',
      mpesaAmount: 7500,
      customerPhone: '+254 724 332 211',
      title: 'Ducted Cold Room Fan Motor Lubrication',
      priority: 'medium',
    },
    {
      id: 'job-1061',
      jobNumber: 'JOB-1061',
      customerName: 'Mary Achieng',
      location: 'Roasters, Thika Rd',
      serviceCategory: 'Plumbing Services',
      startTime: '16:00',
      endTime: '17:30',
      technicianName: 'Brian Otieno',
      status: 'scheduled',
      mpesaStatus: 'paid',
      mpesaAmount: 5200,
      customerPhone: '+254 715 443 322',
      title: 'Under-counter Grease Trap Cleanout & Jetting',
      priority: 'low',
    },
    {
      id: 'job-1062',
      jobNumber: 'JOB-1062',
      customerName: 'George Ochieng',
      location: 'Ngong Road, Nairobi',
      serviceCategory: 'Generator Systems',
      startTime: '16:30',
      endTime: '18:00',
      technicianName: 'James Ndung\'u',
      status: 'scheduled',
      mpesaStatus: 'pending',
      mpesaAmount: 16000,
      customerPhone: '+254 722 001 122',
      title: 'Battery Trickle Charger Circuit Troubleshooting',
      priority: 'medium',
    },
    {
      id: 'job-1063',
      jobNumber: 'JOB-1063',
      customerName: 'Susan Njeri',
      location: 'Gigiri, Nairobi',
      serviceCategory: 'Fire & Safety',
      startTime: '17:00',
      endTime: '18:30',
      technicianName: 'Paul Kibe',
      status: 'scheduled',
      mpesaStatus: 'paid',
      mpesaAmount: 13500,
      customerPhone: '+254 734 556 677',
      title: 'Fire Suppression FM200 Cylinder Pressure Re-certification',
      priority: 'high',
    },

    // En Route (5 total: 2 visible + 3 more jobs)
    {
      id: 'job-1043',
      jobNumber: 'JOB-1043',
      customerName: 'Michael Omondi',
      location: 'Embakasi, Nairobi',
      serviceCategory: 'HVAC Services',
      startTime: '08:45',
      endTime: '10:15',
      technicianName: 'James Ndung\'u',
      technicianAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
      status: 'en_route',
      mpesaStatus: 'pending',
      mpesaAmount: 9500,
      customerPhone: '+254 716 778 899',
      title: 'Server Room Precision Air Conditioning (PAC) Service',
      priority: 'high',
    },
    {
      id: 'job-1046',
      jobNumber: 'JOB-1046',
      customerName: 'Sarah Wairimu',
      location: 'Donholm, Nairobi',
      serviceCategory: 'HVAC Services',
      startTime: '10:00',
      endTime: '11:30',
      technicianName: 'Paul Kibe',
      technicianAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
      status: 'en_route',
      mpesaStatus: 'pending',
      mpesaAmount: 7800,
      customerPhone: '+254 728 990 011',
      title: 'Refrigerant Leak Detection and Nitrogen Pressure Test',
      priority: 'medium',
    },
    {
      id: 'job-1047',
      jobNumber: 'JOB-1047',
      customerName: 'Caleb Kiprono',
      location: 'Mombasa Rd, Nairobi',
      serviceCategory: 'Plumbing Services',
      startTime: '11:15',
      endTime: '12:45',
      technicianName: 'Samuel Njoroge',
      status: 'en_route',
      mpesaStatus: 'paid',
      mpesaAmount: 11200,
      customerPhone: '+254 719 223 344',
      title: 'Water Treatment Sand Filter Media Backwash',
      priority: 'medium',
    },
    {
      id: 'job-1049',
      jobNumber: 'JOB-1049',
      customerName: 'Beatrice Kemunto',
      location: 'Upper Hill, Nairobi',
      serviceCategory: 'Electrical Services',
      startTime: '12:30',
      endTime: '14:00',
      technicianName: 'Martin Wanjohi',
      status: 'en_route',
      mpesaStatus: 'pending',
      mpesaAmount: 15400,
      customerPhone: '+254 725 667 788',
      title: 'Uninterruptible Power Supply (UPS) Capacitor Bank Test',
      priority: 'high',
    },
    {
      id: 'job-1050',
      jobNumber: 'JOB-1050',
      customerName: 'Nicholas Mwangi',
      location: 'Madaraka, Nairobi',
      serviceCategory: 'Commercial Kitchen',
      startTime: '13:00',
      endTime: '14:30',
      technicianName: 'Alex Muli',
      status: 'en_route',
      mpesaStatus: 'pending',
      mpesaAmount: 8900,
      customerPhone: '+254 710 445 566',
      title: 'Walk-in Freezer Evaporator Coil De-icing',
      priority: 'medium',
    },

    // On Site (4 total: 2 visible + 2 more jobs)
    {
      id: 'job-1038',
      jobNumber: 'JOB-1038',
      customerName: 'Esther Nyambura',
      location: 'Rongai, Nairobi',
      serviceCategory: 'Plumbing Services',
      startTime: '09:15',
      endTime: '10:45',
      technicianName: 'Samuel Njoroge',
      technicianAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      status: 'on_site',
      mpesaStatus: 'pending',
      mpesaAmount: 12000,
      customerPhone: '+254 726 112 233',
      title: 'Borehole Submersible Pump Control Panel Inspection',
      priority: 'high',
    },
    {
      id: 'job-1042',
      jobNumber: 'JOB-1042',
      customerName: 'Kevin Otieno',
      location: 'South B, Nairobi',
      serviceCategory: 'Plumbing Services',
      startTime: '10:30',
      endTime: '12:00',
      technicianName: 'Alex Muli',
      technicianAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80',
      status: 'on_site',
      mpesaStatus: 'pending',
      mpesaAmount: 6800,
      customerPhone: '+254 717 334 455',
      title: 'Commercial Sanitary Pipeline Hydro-Jetting',
      priority: 'medium',
    },
    {
      id: 'job-1044',
      jobNumber: 'JOB-1044',
      customerName: 'Grace Muthoni',
      location: 'Ngara, Nairobi',
      serviceCategory: 'HVAC Services',
      startTime: '11:00',
      endTime: '12:30',
      technicianName: 'Peter Njuguna',
      status: 'on_site',
      mpesaStatus: 'paid',
      mpesaAmount: 14500,
      customerPhone: '+254 729 445 566',
      title: 'Clinic Pharmacy Temperature Control Audit',
      priority: 'high',
    },
    {
      id: 'job-1045',
      jobNumber: 'JOB-1045',
      customerName: 'Simon Kiptoo',
      location: 'Loresho, Nairobi',
      serviceCategory: 'Generator Systems',
      startTime: '12:15',
      endTime: '13:45',
      technicianName: 'James Ndung\'u',
      status: 'on_site',
      mpesaStatus: 'pending',
      mpesaAmount: 21000,
      customerPhone: '+254 718 556 677',
      title: 'Synchronizing Panel PLC Communication Restoration',
      priority: 'high',
    },

    // In Progress (6 total: 3 visible + 3 more jobs)
    {
      id: 'job-1032',
      jobNumber: 'JOB-1032',
      customerName: 'Isaac Kiprotich',
      location: 'Parklands, Nairobi',
      serviceCategory: 'HVAC Services',
      startTime: '08:30',
      endTime: '10:30',
      technicianName: 'Peter Njuguna',
      technicianAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      status: 'in_progress',
      mpesaStatus: 'pending',
      mpesaAmount: 16500,
      customerPhone: '+254 713 990 011',
      title: 'Hospital Chiller Flow Rate & Glycol Concentration Overhaul',
      priority: 'emergency',
    },
    {
      id: 'job-1036',
      jobNumber: 'JOB-1036',
      customerName: 'Beatrice Atieno',
      location: 'Hurlingham, Nairobi',
      serviceCategory: 'Plumbing Services',
      startTime: '09:45',
      endTime: '11:45',
      technicianName: 'Brian Otieno',
      technicianAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      status: 'in_progress',
      mpesaStatus: 'paid',
      mpesaAmount: 10400,
      customerPhone: '+254 727 889 900',
      title: 'High-Rise Hydro-pneumatic Tank Membrane Overhaul',
      priority: 'high',
    },
    {
      id: 'job-1040',
      jobNumber: 'JOB-1040',
      customerName: 'Joseph Maina',
      location: 'Lavington, Nairobi',
      serviceCategory: 'Electrical Services',
      startTime: '11:15',
      endTime: '13:15',
      technicianName: 'Martin Wanjohi',
      technicianAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
      status: 'in_progress',
      mpesaStatus: 'paid',
      mpesaAmount: 18200,
      customerPhone: '+254 712 110 099',
      title: 'Solar Grid-Tie Inverter Firmware Upgrade and Grounding Test',
      priority: 'medium',
    },
    {
      id: 'job-1041',
      jobNumber: 'JOB-1041',
      customerName: 'Priscilla Muthua',
      location: 'Thome, Nairobi',
      serviceCategory: 'HVAC Services',
      startTime: '12:00',
      endTime: '13:30',
      technicianName: 'Paul Kibe',
      status: 'in_progress',
      mpesaStatus: 'pending',
      mpesaAmount: 9200,
      customerPhone: '+254 731 223 344',
      title: 'Cleanroom HEPA Filter Differential Pressure Balancing',
      priority: 'high',
    },
    {
      id: 'job-1037',
      jobNumber: 'JOB-1037',
      customerName: 'Dennis Mutiso',
      location: 'Ridgeways, Nairobi',
      serviceCategory: 'Generator Systems',
      startTime: '12:45',
      endTime: '14:45',
      technicianName: 'James Ndung\'u',
      status: 'in_progress',
      mpesaStatus: 'paid',
      mpesaAmount: 32000,
      customerPhone: '+254 720 445 566',
      title: 'Prime Power Perkins Engine Turbocharger Resealing',
      priority: 'emergency',
    },
    {
      id: 'job-1039',
      jobNumber: 'JOB-1039',
      customerName: 'Irene Wanjiru',
      location: 'Karen Plains, Nairobi',
      serviceCategory: 'Plumbing Services',
      startTime: '13:30',
      endTime: '15:00',
      technicianName: 'Samuel Njoroge',
      status: 'in_progress',
      mpesaStatus: 'pending',
      mpesaAmount: 7900,
      customerPhone: '+254 714 667 788',
      title: 'Effluent Sump Pump Float Switch Array Replacement',
      priority: 'medium',
    },

    // Completed (8 total: 3 visible + 5 more jobs)
    {
      id: 'job-1021',
      jobNumber: 'JOB-1021',
      customerName: 'Daniel Chege',
      location: 'Umoja, Nairobi',
      serviceCategory: 'HVAC Services',
      startTime: '07:30',
      endTime: '09:00',
      technicianName: 'James Ndung\'u',
      technicianAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
      status: 'completed',
      mpesaStatus: 'paid',
      mpesaAmount: 7200,
      customerPhone: '+254 721 776 655',
      title: 'Bakery Proofing Chamber Humidity Sensor Calibration',
      priority: 'medium',
    },
    {
      id: 'job-1024',
      jobNumber: 'JOB-1024',
      customerName: 'Grace Wanjiku',
      location: 'Buruburu, Nairobi',
      serviceCategory: 'HVAC Services',
      startTime: '08:15',
      endTime: '09:45',
      technicianName: 'Paul Kibe',
      technicianAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
      status: 'completed',
      mpesaStatus: 'paid',
      mpesaAmount: 11500,
      customerPhone: '+254 716 332 211',
      title: 'Commercial Refrigeration TXV Thermal Expansion Valve Flush',
      priority: 'high',
    },
    {
      id: 'job-1027',
      jobNumber: 'JOB-1027',
      customerName: 'Robert Kiprono',
      location: 'Kasarani, Nairobi',
      serviceCategory: 'Plumbing Services',
      startTime: '09:00',
      endTime: '10:30',
      technicianName: 'Samuel Njoroge',
      technicianAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      status: 'completed',
      mpesaStatus: 'paid',
      mpesaAmount: 6400,
      customerPhone: '+254 725 443 322',
      title: 'Water Supply Ring Main Ball Valve Replacement',
      priority: 'low',
    },
    {
      id: 'job-1028',
      jobNumber: 'JOB-1028',
      customerName: 'Agnes Mumbua',
      location: 'Kitengela, Nairobi',
      serviceCategory: 'Electrical Services',
      startTime: '09:30',
      endTime: '11:00',
      technicianName: 'Martin Wanjohi',
      status: 'completed',
      mpesaStatus: 'paid',
      mpesaAmount: 13900,
      customerPhone: '+254 722 778 899',
      title: 'Power Factor Correction (PFC) Contactor Swap',
      priority: 'medium',
    },
    {
      id: 'job-1029',
      jobNumber: 'JOB-1029',
      customerName: 'Benjamin Kirui',
      location: 'Syokimau, Nairobi',
      serviceCategory: 'Commercial Kitchen',
      startTime: '10:00',
      endTime: '11:30',
      technicianName: 'Alex Muli',
      status: 'completed',
      mpesaStatus: 'paid',
      mpesaAmount: 8800,
      customerPhone: '+254 711 009 988',
      title: 'Industrial Dishwasher Rinse Booster Element Overhaul',
      priority: 'medium',
    },
    {
      id: 'job-1030',
      jobNumber: 'JOB-1030',
      customerName: 'Veronica Njoki',
      location: 'Kilimani, Nairobi',
      serviceCategory: 'HVAC Services',
      startTime: '10:30',
      endTime: '12:00',
      technicianName: 'Peter Njuguna',
      status: 'completed',
      mpesaStatus: 'paid',
      mpesaAmount: 15000,
      customerPhone: '+254 728 334 455',
      title: 'R410A Condenser Coil Acid Wash & Airflow Testing',
      priority: 'high',
    },
    {
      id: 'job-1031',
      jobNumber: 'JOB-1031',
      customerName: 'Edwin Barasa',
      location: 'Ruaka, Nairobi',
      serviceCategory: 'Generator Systems',
      startTime: '11:00',
      endTime: '12:30',
      technicianName: 'James Ndung\'u',
      status: 'completed',
      mpesaStatus: 'paid',
      mpesaAmount: 19500,
      customerPhone: '+254 719 556 677',
      title: 'Cummins Diesel Fuel Injector Ultrasonic Cleaning',
      priority: 'medium',
    },
    {
      id: 'job-1033',
      jobNumber: 'JOB-1033',
      customerName: 'Gladys Muthoni',
      location: 'Muthaiga, Nairobi',
      serviceCategory: 'Plumbing Services',
      startTime: '11:30',
      endTime: '13:00',
      technicianName: 'Brian Otieno',
      status: 'completed',
      mpesaStatus: 'paid',
      mpesaAmount: 12800,
      customerPhone: '+254 720 112 244',
      title: 'Swimming Pool Sand Filter Multivalve O-Ring Overhaul',
      priority: 'low',
    },
  ]);

  // Live technicians data matching KDBRi.jpg
  const liveTechnicians: LiveTechCard[] = [
    {
      id: 'tech-1',
      name: 'Peter Njuguna',
      role: 'HVAC Tech',
      location: 'Westlands, Nairobi',
      activeJob: 'JOB-1032',
      activeStatus: 'In Progress',
      gpsSignal: 'Strong',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: 'tech-2',
      name: 'Brian Otieno',
      role: 'Plumbing Tech',
      location: 'Kilimani, Nairobi',
      activeJob: 'JOB-1036',
      activeStatus: 'In Progress',
      gpsSignal: 'Strong',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: 'tech-3',
      name: 'James Ndung\'u',
      role: 'HVAC Tech',
      location: 'Embakasi, Nairobi',
      activeJob: 'JOB-1043',
      activeStatus: 'En Route',
      gpsSignal: 'Good',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: 'tech-4',
      name: 'Samuel Njoroge',
      role: 'Plumbing Tech',
      location: 'Rongai, Nairobi',
      activeJob: 'JOB-1038',
      activeStatus: 'On Site',
      gpsSignal: 'Strong',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: 'tech-5',
      name: 'Paul Kibe',
      role: 'HVAC Tech',
      location: 'Donholm, Nairobi',
      activeJob: 'JOB-1046',
      activeStatus: 'En Route',
      gpsSignal: 'Good',
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: 'tech-6',
      name: 'Martin Wanjohi',
      role: 'Technician',
      location: "Lang'ata, Nairobi",
      activeJob: 'JOB-1054',
      activeStatus: 'Scheduled',
      gpsSignal: 'Offline',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: 'tech-7',
      name: 'Alex Muli',
      role: 'Plumbing Tech',
      location: 'South B, Nairobi',
      activeJob: 'JOB-1042',
      activeStatus: 'On Site',
      gpsSignal: 'Good',
      avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80',
    },
  ];

  // Column definitions matching KDBRi.jpg
  const columns: Array<{
    id: 'scheduled' | 'en_route' | 'on_site' | 'in_progress' | 'completed';
    label: string;
    dotColor: string;
    accentBorder: string;
    initialVisibleCount: number;
  }> = [
    {
      id: 'scheduled',
      label: 'Scheduled',
      dotColor: '#3B82F6',
      accentBorder: 'border-blue-500/60',
      initialVisibleCount: 3,
    },
    {
      id: 'en_route',
      label: 'En Route',
      dotColor: '#F59E0B',
      accentBorder: 'border-amber-500/60',
      initialVisibleCount: 2,
    },
    {
      id: 'on_site',
      label: 'On Site',
      dotColor: '#A855F7',
      accentBorder: 'border-purple-500/60',
      initialVisibleCount: 2,
    },
    {
      id: 'in_progress',
      label: 'In Progress',
      dotColor: '#14B8A6',
      accentBorder: 'border-teal-500/60',
      initialVisibleCount: 3,
    },
    {
      id: 'completed',
      label: 'Completed',
      dotColor: '#22C55E',
      accentBorder: 'border-emerald-500/60',
      initialVisibleCount: 3,
    },
  ];

  // Time ruler slots matching KDBRi.jpg
  const timeSlots = [
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
  ];

  // Filtered jobs calculation
  const filteredJobs = useMemo(() => {
    return jobList.filter(job => {
      // Search matching
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          job.jobNumber.toLowerCase().includes(q) ||
          job.customerName.toLowerCase().includes(q) ||
          job.location.toLowerCase().includes(q) ||
          job.technicianName.toLowerCase().includes(q) ||
          job.title.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      // Service filter
      if (selectedService !== 'All Services') {
        if (!job.serviceCategory.toLowerCase().includes(selectedService.toLowerCase().replace(' services', ''))) {
          return false;
        }
      }

      // Technician filter
      if (selectedTechFilter !== 'All Technicians') {
        if (!job.technicianName.toLowerCase().includes(selectedTechFilter.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [jobList, searchQuery, selectedService, selectedTechFilter]);

  // Handle Drag & Drop
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedJobId(id);
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    setDragOverColumn(colId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: any) => {
    e.preventDefault();
    setDragOverColumn(null);
    const id = e.dataTransfer.getData('text/plain') || draggedJobId;
    if (!id) return;

    setJobList(prev =>
      prev.map(j => (j.id === id ? { ...j, status: targetStatus } : j))
    );

    const job = jobList.find(j => j.id === id);
    showToast(
      `${job?.jobNumber || 'Work order'} shifted to ${targetStatus.replace('_', ' ').toUpperCase()}`,
      'success'
    );
    setDraggedJobId(null);
  };

  // Quick refresh action
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Dispatch board updated in real time', 'success');
    }, 600);
  };

  // Toggle "+ X more jobs"
  const toggleColumnExpanded = (colId: string) => {
    setExpandedColumns(prev => ({
      ...prev,
      [colId]: !prev[colId],
    }));
  };

  // M-Pesa STK Push Simulation
  const handleTriggerMpesaStkPush = (job: FocusedJob) => {
    setStkPushInProgress(true);
    setTimeout(() => {
      setStkPushInProgress(false);
      setJobList(prev =>
        prev.map(j => (j.id === job.id ? { ...j, mpesaStatus: 'paid' } : j))
      );
      if (inspectJob?.id === job.id) {
        setInspectJob(prev => prev ? { ...prev, mpesaStatus: 'paid' } : null);
      }
      showToast(
        `M-Pesa STK Push prompt sent to ${job.customerPhone}. KES ${job.mpesaAmount?.toLocaleString()} verified!`,
        'success'
      );
    }, 1200);
  };

  return (
    <div className="w-full flex flex-col space-y-3.5 antialiased font-sans">
      {/* 1. TOP CONTROL TOOLBAR matching KDBRi.jpg */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-2xl bg-[#0E1620] border border-[#1E293B]">
        {/* Left Side: Search + Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
          {/* Search Input: "Search jobs or technicians..." */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search jobs or technicians..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#111A24] border border-[#1E293B] text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#14B8A6] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Service Filter Dropdown: "All Services ⌵" */}
          <div className="relative">
            <select
              value={selectedService}
              onChange={e => setSelectedService(e.target.value)}
              className="appearance-none pl-3.5 pr-8 py-2 rounded-xl bg-[#111A24] border border-[#1E293B] text-xs font-medium text-slate-200 focus:outline-none focus:border-[#14B8A6] cursor-pointer"
            >
              <option value="All Services">All Services</option>
              <option value="HVAC">HVAC Services</option>
              <option value="Plumbing">Plumbing Services</option>
              <option value="Electrical">Electrical Services</option>
              <option value="Generator">Generator Systems</option>
              <option value="Commercial Kitchen">Commercial Kitchen</option>
              <option value="Fire & Safety">Fire & Safety</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Technician Filter Dropdown: "All Technicians ⌵" */}
          <div className="relative">
            <select
              value={selectedTechFilter}
              onChange={e => setSelectedTechFilter(e.target.value)}
              className="appearance-none pl-3.5 pr-8 py-2 rounded-xl bg-[#111A24] border border-[#1E293B] text-xs font-medium text-slate-200 focus:outline-none focus:border-[#14B8A6] cursor-pointer"
            >
              <option value="All Technicians">All Technicians</option>
              <option value="Peter Njuguna">Peter Njuguna (HVAC)</option>
              <option value="Brian Otieno">Brian Otieno (Plumbing)</option>
              <option value="James Ndung'u">James Ndung'u (HVAC)</option>
              <option value="Samuel Njoroge">Samuel Njoroge (Plumbing)</option>
              <option value="Paul Kibe">Paul Kibe (HVAC)</option>
              <option value="Martin Wanjohi">Martin Wanjohi (Electrical)</option>
              <option value="Alex Muli">Alex Muli (Plumbing)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Right Side: Refresh Button ↻ */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={handleRefresh}
            title="Refresh Board"
            className="p-2.5 rounded-xl bg-[#111A24] hover:bg-[#16202C] border border-[#1E293B] text-slate-300 hover:text-white transition-all group"
          >
            <RotateCw
              className={`w-4 h-4 text-slate-300 group-hover:text-[#14B8A6] ${
                isRefreshing ? 'animate-spin text-[#14B8A6]' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* 2. MAIN FOCUSED MATRIX: BOARD (Left ~75%) + LIVE TECHNICIANS (Right ~25%) matching KDBRi.jpg */}
      <div className="flex flex-col xl:flex-row items-stretch gap-0 bg-[#0B1118] border border-[#1E293B] rounded-2xl overflow-hidden shadow-2xl">
        {/* LEFT / CENTER: DISPATCH BOARD WITH TIME RULER & 5 COLUMNS */}
        <div className="flex-1 min-w-0 flex flex-col p-4 bg-[#080D13] overflow-x-auto">
          <div className="flex items-start gap-3 min-w-[920px]">
            {/* Time Ruler Column on Left matching screenshot (08:00 - 17:00) */}
            <div className="w-12 flex-shrink-0 pt-10 flex flex-col select-none">
              {timeSlots.map(time => (
                <div
                  key={time}
                  className="h-28 text-slate-500 font-mono text-[11px] font-medium text-right pr-2 pt-1 border-r border-[#1E293B]/60"
                >
                  {time}
                </div>
              ))}
            </div>

            {/* 5 Status Columns Grid */}
            <div className="flex-1 grid grid-cols-5 gap-3.5">
              {columns.map(col => {
                const colJobs = filteredJobs.filter(j => j.status === col.id);
                const isExpanded = expandedColumns[col.id];
                const visibleJobs = isExpanded
                  ? colJobs
                  : colJobs.slice(0, col.initialVisibleCount);
                const hiddenCount = colJobs.length - col.initialVisibleCount;
                const isDropTarget = dragOverColumn === col.id;

                return (
                  <div
                    key={col.id}
                    onDragOver={e => handleDragOver(e, col.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={e => handleDrop(e, col.id)}
                    className={`flex flex-col rounded-2xl transition-all duration-200 ${
                      isDropTarget
                        ? 'bg-[#142628]/60 ring-2 ring-[#14B8A6]'
                        : 'bg-transparent'
                    }`}
                  >
                    {/* Column Header matching screenshot: Dot + Status Name + Jobs Count */}
                    <div className="flex items-center justify-between pb-3 px-1 border-b border-[#1E293B]/70">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: col.dotColor }}
                        />
                        <span className="text-sm font-semibold text-white tracking-tight">
                          {col.label}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        {colJobs.length} jobs
                      </span>
                    </div>

                    {/* Job Cards Stack */}
                    <div className="flex-1 pt-3.5 space-y-3 min-h-[500px]">
                      {visibleJobs.map(job => (
                        <div
                          key={job.id}
                          draggable
                          onDragStart={e => handleDragStart(e, job.id)}
                          onClick={() => setInspectJob(job)}
                          className={`relative p-3.5 rounded-xl bg-[#111A24] hover:bg-[#14202D] border border-[#1E293B] hover:border-slate-600 transition-all duration-150 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md group`}
                        >
                          {/* Row 1: Job Number (JOB-1048) */}
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-bold text-white text-xs tracking-wider">
                              {job.jobNumber}
                            </span>
                            {job.priority === 'emergency' && (
                              <span className="text-[10px] font-bold text-rose-400 bg-rose-950/70 border border-rose-800/40 px-1.5 py-0.5 rounded">
                                Urgent
                              </span>
                            )}
                          </div>

                          {/* Row 2: Customer Name, Location */}
                          <div className="text-xs font-semibold text-slate-200 truncate mb-2">
                            {job.customerName}, {job.location}
                          </div>

                          {/* Row 3: Scheduled Time (🕒 08:00 - 10:00) */}
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono mb-2.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span>
                              {job.startTime} - {job.endTime}
                            </span>
                          </div>

                          {/* Row 4: Technician Avatar + Name */}
                          <div className="flex items-center gap-2 mb-3">
                            {job.technicianAvatar ? (
                              <img
                                src={job.technicianAvatar}
                                alt={job.technicianName}
                                className="w-5 h-5 rounded-full object-cover ring-1 ring-[#1E293B]"
                              />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-slate-700 text-[10px] flex items-center justify-center font-bold text-slate-200">
                                {job.technicianName.slice(0, 1)}
                              </div>
                            )}
                            <span className="text-[11px] font-medium text-slate-300 truncate">
                              {job.technicianName}
                            </span>
                          </div>

                          {/* Row 5: M-Pesa Badge & 3-dots Menu */}
                          <div className="flex items-center justify-between pt-2 border-t border-[#1E293B]/70">
                            {job.mpesaStatus === 'paid' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-[#0E2A20] text-emerald-400 border border-emerald-800/40">
                                <Check className="w-3 h-3 stroke-[3]" />
                                <span>M-Pesa</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-[#1F1B38] text-purple-300 border border-purple-800/40">
                                <span className="font-bold text-[9px]">M</span>
                                <span>M-Pesa</span>
                              </span>
                            )}

                            {/* 3-dots Action Menu */}
                            <div className="relative">
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  setActiveMenuJobId(
                                    activeMenuJobId === job.id ? null : job.id
                                  );
                                }}
                                className="p-1 text-slate-400 hover:text-white rounded hover:bg-[#1E293B] transition-colors"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </button>

                              {activeMenuJobId === job.id && (
                                <div
                                  onClick={e => e.stopPropagation()}
                                  className="absolute right-0 bottom-full mb-1 w-44 bg-[#0E1620] border border-[#1E293B] rounded-xl shadow-2xl py-1.5 z-40 text-xs"
                                >
                                  <button
                                    onClick={() => {
                                      setInspectJob(job);
                                      setActiveMenuJobId(null);
                                    }}
                                    className="w-full px-3 py-1.5 text-left text-slate-200 hover:bg-[#16202C] flex items-center gap-2"
                                  >
                                    <Briefcase className="w-3.5 h-3.5 text-[#14B8A6]" />
                                    <span>View Work Order</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleTriggerMpesaStkPush(job);
                                      setActiveMenuJobId(null);
                                    }}
                                    className="w-full px-3 py-1.5 text-left text-slate-200 hover:bg-[#16202C] flex items-center gap-2"
                                  >
                                    <Send className="w-3.5 h-3.5 text-purple-400" />
                                    <span>Prompt M-Pesa STK</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setActiveTab('map');
                                      setActiveMenuJobId(null);
                                    }}
                                    className="w-full px-3 py-1.5 text-left text-slate-200 hover:bg-[#16202C] flex items-center gap-2"
                                  >
                                    <MapPin className="w-3.5 h-3.5 text-teal-400" />
                                    <span>Locate on GPS Map</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* "+ X more jobs" button matching screenshot */}
                      {hiddenCount > 0 && !isExpanded && (
                        <button
                          onClick={() => toggleColumnExpanded(col.id)}
                          className="w-full py-2.5 text-center text-xs font-semibold text-slate-400 hover:text-[#14B8A6] hover:bg-[#111A24] border border-dashed border-[#1E293B] rounded-xl transition-all"
                        >
                          + {hiddenCount} more jobs
                        </button>
                      )}

                      {isExpanded && colJobs.length > col.initialVisibleCount && (
                        <button
                          onClick={() => toggleColumnExpanded(col.id)}
                          className="w-full py-2 text-center text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                        >
                          Show fewer jobs
                        </button>
                      )}

                      {colJobs.length === 0 && (
                        <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-[#1E293B]/50 rounded-xl">
                          No jobs in this stage
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: LIVE TECHNICIANS matching KDBRi.jpg (~320px width) */}
        <div className="w-full xl:w-80 flex-shrink-0 bg-[#0E1620] border-t xl:border-t-0 xl:border-l border-[#1E293B] flex flex-col">
          {/* Header matching screenshot: "Live Technicians  • 15"  "• GPS On" */}
          <div className="p-4 border-b border-[#1E293B] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white tracking-tight">
                Live Technicians
              </span>
              <span className="flex items-center gap-1 text-xs font-semibold text-[#14B8A6]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6]" />
                15
              </span>
            </div>

            {/* GPS Status Indicator */}
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>GPS On</span>
            </div>
          </div>

          {/* List of Technicians matching screenshot */}
          <div className="flex-1 divide-y divide-[#1E293B]/70 overflow-y-auto max-h-[620px]">
            {liveTechnicians.map(tech => (
              <div
                key={tech.id}
                onClick={() => {
                  setSelectedTechFilter(tech.name);
                  showToast(`Filtered board for ${tech.name}`, 'info');
                }}
                className={`p-3.5 hover:bg-[#111A24] cursor-pointer transition-colors group ${
                  selectedTechFilter === tech.name ? 'bg-[#111A24] border-l-2 border-l-[#14B8A6]' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Avatar */}
                    <img
                      src={tech.avatarUrl}
                      alt={tech.name}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-[#1E293B] flex-shrink-0 group-hover:ring-[#14B8A6] transition-all"
                    />

                    {/* Details */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white truncate">
                          {tech.name}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mb-1.5">
                        {tech.role}
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
                        <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{tech.location}</span>
                      </div>

                      {/* Active Job */}
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Briefcase className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span>
                          {tech.activeJob} • {tech.activeStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* GPS Signal Indicator */}
                  <div className="flex items-center gap-1 flex-shrink-0 pt-0.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        tech.gpsSignal === 'Strong'
                          ? 'bg-[#14B8A6]'
                          : tech.gpsSignal === 'Good'
                          ? 'bg-emerald-400'
                          : 'bg-slate-500'
                      }`}
                    />
                    <span
                      className={`text-[11px] font-medium ${
                        tech.gpsSignal === 'Strong'
                          ? 'text-[#14B8A6]'
                          : tech.gpsSignal === 'Good'
                          ? 'text-emerald-400'
                          : 'text-slate-500'
                      }`}
                    >
                      {tech.gpsSignal}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Footer: "View all technicians →" matching screenshot */}
          <div className="p-3 border-t border-[#1E293B] bg-[#0E1620]">
            <button
              onClick={() => setActiveTab('technician')}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-[#14B8A6] hover:text-teal-300 hover:bg-[#142628] transition-colors"
            >
              <span>View all technicians</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. MODAL: DETAILED WORK ORDER INSPECTION & ACTIONS */}
      {inspectJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-[#0E1620] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#1E293B] flex items-center justify-between bg-[#111A24]">
              <div className="flex items-center gap-3">
                <span className="text-base font-bold text-white tracking-wider">
                  {inspectJob.jobNumber}
                </span>
                <span className="text-xs uppercase font-semibold text-[#14B8A6] bg-[#0E2A27] border border-[#14B8A6]/40 px-2 py-0.5 rounded-full">
                  {inspectJob.status.replace('_', ' ')}
                </span>
              </div>
              <button
                onClick={() => setInspectJob(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#1E293B] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs overflow-y-auto max-h-[70vh]">
              {/* Title & Service */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-1">
                  {inspectJob.title}
                </h4>
                <div className="text-slate-400">{inspectJob.serviceCategory}</div>
              </div>

              {/* Grid with Details */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#111A24] border border-[#1E293B]">
                <div>
                  <div className="text-slate-400 text-[11px] mb-0.5">Customer</div>
                  <div className="text-white font-medium">{inspectJob.customerName}</div>
                  <div className="text-slate-400">{inspectJob.customerPhone}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[11px] mb-0.5">Location</div>
                  <div className="text-white font-medium">{inspectJob.location}</div>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(inspectJob.location)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#14B8A6] hover:underline flex items-center gap-1 text-[11px] mt-0.5"
                  >
                    <span>View on Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div>
                  <div className="text-slate-400 text-[11px] mb-0.5">Scheduled Slot</div>
                  <div className="text-white font-medium">
                    {inspectJob.startTime} - {inspectJob.endTime} (EAT)
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-[11px] mb-0.5">Assigned Specialist</div>
                  <div className="text-white font-medium">{inspectJob.technicianName}</div>
                </div>
              </div>

              {/* M-Pesa Payment Status & STK Action */}
              <div className="p-4 rounded-xl bg-[#111A24] border border-[#1E293B] flex items-center justify-between">
                <div>
                  <div className="text-slate-400 text-[11px] mb-0.5">M-Pesa Payment Verification</div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-sm">
                      KES {inspectJob.mpesaAmount?.toLocaleString()}
                    </span>
                    {inspectJob.mpesaStatus === 'paid' ? (
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/70 border border-emerald-800/40 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Verified Received</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-purple-300 bg-purple-950/70 border border-purple-800/40 px-2 py-0.5 rounded-md">
                        Pending Payment
                      </span>
                    )}
                  </div>
                </div>

                {inspectJob.mpesaStatus !== 'paid' && (
                  <button
                    onClick={() => handleTriggerMpesaStkPush(inspectJob)}
                    disabled={stkPushInProgress}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#14B8A6] hover:bg-[#0D9488] active:bg-[#0F766E] text-black font-semibold text-xs transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{stkPushInProgress ? 'Pushing...' : 'Prompt M-Pesa STK'}</span>
                  </button>
                )}
              </div>

              {/* Status Transition Control */}
              <div>
                <label className="block text-slate-400 text-[11px] font-medium mb-1.5">
                  Update Stage Status
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {columns.map(c => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setJobList(prev =>
                          prev.map(j =>
                            j.id === inspectJob.id ? { ...j, status: c.id } : j
                          )
                        );
                        setInspectJob(prev => prev ? { ...prev, status: c.id } : null);
                        showToast(`Status updated to ${c.label}`, 'success');
                      }}
                      className={`py-2 px-1 text-center rounded-xl text-[11px] font-semibold transition-all ${
                        inspectJob.status === c.id
                          ? 'bg-[#14B8A6] text-black font-bold ring-2 ring-teal-400'
                          : 'bg-[#16202C] text-slate-300 hover:bg-[#1E293B]'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#1E293B] bg-[#111A24] flex items-center justify-between">
              <a
                href={`tel:${inspectJob.customerPhone}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#16202C] hover:bg-[#1E293B] text-slate-200 text-xs font-medium transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#14B8A6]" />
                <span>Call Customer</span>
              </a>

              <button
                onClick={() => setInspectJob(null)}
                className="px-4 py-1.5 rounded-xl bg-[#14B8A6] text-black text-xs font-semibold hover:bg-[#0D9488] transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
