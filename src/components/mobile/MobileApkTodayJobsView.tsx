import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  Navigation,
  Phone,
  Clock,
  MapPin,
  Briefcase,
  CheckCircle2,
  Home,
  ClipboardList,
  Map as MapIcon,
  User as UserIcon,
  Search,
  Check,
  ArrowLeft,
  Camera,
  Upload,
  Plus,
  ShieldCheck,
  ExternalLink,
  Smartphone,
  Maximize2,
  Minimize2,
  X,
  Battery,
  Wifi,
  Signal,
  Calendar,
  Sparkles,
  CheckSquare,
  FileCheck,
  Send,
  AlertCircle
} from 'lucide-react';
import { SignaturePad } from '../common/SignaturePad';
import { MobileJobDetailScreen } from './MobileJobDetailScreen';
import { MobileLiveTrackingView } from './MobileLiveTrackingView';
import { MobileJobCompletionScreen } from './MobileJobCompletionScreen';

// WhatsApp Brand Icon
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
  </svg>
);

// Fieldnora Stylized Ribbon Logo as shown in Ci01L.jpg
const FieldnoraAppLogo: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 28 28" fill="none" className={className}>
    <path
      d="M4 6.5C4 5.12 5.12 4 6.5 4H18.5C20.43 4 22 5.57 22 7.5C22 9.43 20.43 11 18.5 11H6.5C5.12 11 4 9.88 4 8.5V6.5Z"
      fill="#14B8A6"
    />
    <path
      d="M4 13.5C4 12.12 5.12 11 6.5 11H15.5C17.43 11 19 12.57 19 14.5C19 16.43 17.43 18 15.5 18H6.5C5.12 18 4 16.88 4 15.5V13.5Z"
      fill="#2DD4BF"
    />
    <path
      d="M4 6.5V22.5C4 23.88 5.12 25 6.5 25C7.88 25 9 23.88 9 22.5V6.5C9 5.12 7.88 4 6.5 4C5.12 4 4 5.12 4 6.5Z"
      fill="#0D9488"
    />
  </svg>
);

export interface MobileJobItem {
  id: string;
  jobNumber: string;
  customerName: string;
  location: string;
  address: string;
  timeRange: string;
  status: 'en_route' | 'on_site' | 'in_progress' | 'completed' | 'scheduled';
  statusLabel: string;
  title: string;
  description: string;
  phone: string;
  latitude: number;
  longitude: number;
  priceKes: number;
  checklist: Array<{ id: string; label: string; done: boolean }>;
  photos: Array<{ id: string; url: string; caption: string; phase: 'before' | 'during' | 'after' }>;
  materials: Array<{ id: string; name: string; qty: number; unitPrice: number }>;
  signature?: { signerName: string; timestamp: string; dataUrl: string };
}

// Initial mobile jobs matching screenshot Ci01L.jpg and thWmW.jpg
const INITIAL_MOBILE_JOBS: MobileJobItem[] = [
  {
    id: 'mob-job-00',
    jobNumber: 'JOB-2025-0587',
    customerName: 'Peter Mwangi',
    location: 'Westlands, Nairobi',
    address: 'Westlands Square, Block B, 3rd Floor, Westlands, Nairobi',
    timeRange: '9:30 AM – 1:30 PM',
    status: 'on_site',
    statusLabel: 'On Site',
    title: 'AC Inspection & Repair, Gas Top-up',
    description: 'AC not cooling, indoor fan running but no cold air. Check refrigerant levels and inspect thermostat.',
    phone: '0712 345 678',
    latitude: -1.2635,
    longitude: 36.8020,
    priceKes: 8500,
    checklist: [
      { id: 'c1', label: 'Measure refrigerant suction & discharge pressures', done: true },
      { id: 'c2', label: 'Inspect thermostat wiring & temperature delta', done: true },
      { id: 'c3', label: 'Apply nitrogen pressure leak test to joints', done: false },
      { id: 'c4', label: 'Top up 1kg R410A refrigerant & verify subcooling', done: false },
    ],
    photos: [
      {
        id: 'p0',
        url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
        caption: 'AC Evaporator unit pre-service',
        phase: 'before'
      }
    ],
    materials: [
      { id: 'm1', name: 'R410A Refrigerant (1kg)', qty: 1, unitPrice: 3500 },
      { id: 'm2', name: 'Copper Pipe Insulation', qty: 1, unitPrice: 1200 },
    ]
  },
  {
    id: 'mob-job-01',
    jobNumber: 'JOB-250524-001',
    customerName: 'John Mwangi',
    location: 'Lavington, Nairobi',
    address: 'James Gichuru Rd, Lavington Green Villa 14, Nairobi',
    timeRange: '8:00 AM – 12:00 PM',
    status: 'en_route',
    statusLabel: 'En Route',
    title: 'Inverter Backup System Diagnostic & Battery Cell Balancing',
    description: 'Victron MultiPlus 5kVA system tripping under high load. Check lithium battery BMS communication, DC breaker torquing, and firmware update.',
    phone: '+254 722 123 456',
    latitude: -1.2845,
    longitude: 36.7680,
    priceKes: 14500,
    checklist: [
      { id: 'c1', label: 'Verify DC busbar voltage & battery SOC', done: true },
      { id: 'c2', label: 'Test inverter transfer switch under load', done: false },
      { id: 'c3', label: 'Inspect AC input surge protection device', done: false },
      { id: 'c4', label: 'Record final telemetry log & take photos', done: false },
    ],
    photos: [
      {
        id: 'p1',
        url: 'https://images.unsplash.com/photo-1558441719-8b449c6ff670?w=600&auto=format&fit=crop&q=80',
        caption: 'Pre-service battery terminal scan',
        phase: 'before'
      }
    ],
    materials: [
      { id: 'm1', name: 'Schneider 63A 2P DC Isolator', qty: 1, unitPrice: 4200 },
      { id: 'm2', name: 'Solar Cable 25mm² Red/Black (3m)', qty: 2, unitPrice: 1650 },
    ]
  },
  {
    id: 'mob-job-02',
    jobNumber: 'JOB-250524-002',
    customerName: 'Amina Sheikh',
    location: 'Westlands, Nairobi',
    address: 'Muthithi Road, Park Suites 5th Floor, Westlands, Nairobi',
    timeRange: '10:00 AM – 2:00 PM',
    status: 'on_site',
    statusLabel: 'On Site',
    title: 'Precision Server Room Air Conditioning Maintenance',
    description: 'Quarterly preventative service for redundant CRAC unit. Replace high-efficiency air filters, measure R410A refrigerant pressure, check condensation drain pump.',
    phone: '+254 733 987 654',
    latitude: -1.2642,
    longitude: 36.8025,
    priceKes: 18500,
    checklist: [
      { id: 'c1', label: 'Replace primary pleated air intake filters', done: true },
      { id: 'c2', label: 'Pressure test suction & discharge ports', done: true },
      { id: 'c3', label: 'Flush drain pan with algaecide treatment', done: false },
      { id: 'c4', label: 'Calibrate digital wall thermostat sensor', done: false },
    ],
    photos: [
      {
        id: 'p2',
        url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
        caption: 'Air intake coil before cleaning',
        phase: 'before'
      }
    ],
    materials: [
      { id: 'm1', name: 'R410A Refrigerant Top-up (2.5kg)', qty: 1, unitPrice: 3800 },
      { id: 'm2', name: 'Pleated CRAC Filter Pack 500x500', qty: 2, unitPrice: 2400 },
    ]
  },
  {
    id: 'mob-job-03',
    jobNumber: 'JOB-250524-003',
    customerName: 'Brian Otieno',
    location: 'Embakasi, Nairobi',
    address: 'Airport North Road, Gateway Logistics Complex, Embakasi',
    timeRange: '12:00 PM – 4:00 PM',
    status: 'in_progress',
    statusLabel: 'In Progress',
    title: 'High-Pressure Booster Pump Overhaul & Non-Return Valve Replacement',
    description: 'Pump cycling continuously due to faulty pressure tank bladder and worn mechanical seal. Replace non-return check valve and calibrate pressure switch.',
    phone: '+254 711 556 778',
    latitude: -1.3210,
    longitude: 36.9050,
    priceKes: 22000,
    checklist: [
      { id: 'c1', label: 'Isolate main water supply & discharge pressure', done: true },
      { id: 'c2', label: 'Replace non-return foot check valve (1.5 inch)', done: true },
      { id: 'c3', label: 'Re-pressurize diaphragm expansion vessel to 2.5 bar', done: true },
      { id: 'c4', label: 'Test automatic cut-in & cut-off pressures', done: false },
    ],
    photos: [
      {
        id: 'p3',
        url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80',
        caption: 'Booster manifold replacement in progress',
        phase: 'during'
      }
    ],
    materials: [
      { id: 'm1', name: 'Brass Spring Check Valve 1.5"', qty: 1, unitPrice: 3200 },
      { id: 'm2', name: 'Mechanical Carbon-Ceramic Shaft Seal', qty: 1, unitPrice: 2800 },
      { id: 'm3', name: 'High-Pressure Pressure Gauge 0-10 Bar', qty: 1, unitPrice: 1500 },
    ]
  },
  // Additional completed jobs for metrics interaction
  {
    id: 'mob-job-04',
    jobNumber: 'JOB-250524-004',
    customerName: 'Wanjiku Kamau',
    location: 'Kilimani, Nairobi',
    address: 'Argwings Kodhek Rd, Wood Avenue Court 3B, Kilimani',
    timeRange: '6:30 AM – 8:00 AM',
    status: 'completed',
    statusLabel: 'Completed',
    title: 'Solar Water Heater Thermostat & Element Swap',
    description: 'Replaced burnt 3kW immersion heating element and 20A digital controller. System heated water to 62°C on test.',
    phone: '+254 720 334 455',
    latitude: -1.2915,
    longitude: 36.7892,
    priceKes: 9500,
    checklist: [
      { id: 'c1', label: 'Drain collector tank to safety level', done: true },
      { id: 'c2', label: 'Install new 3kW copper element & gasket', done: true },
      { id: 'c3', label: 'Verify zero water leakage at 3 bar', done: true },
      { id: 'c4', label: 'Customer acceptance sign-off captured', done: true },
    ],
    photos: [],
    materials: [
      { id: 'm1', name: '3kW Solar Immersion Element Flanged', qty: 1, unitPrice: 4500 }
    ],
    signature: {
      signerName: 'Wanjiku Kamau',
      timestamp: '2025-05-24 07:55 AM',
      dataUrl: ''
    }
  },
  {
    id: 'mob-job-05',
    jobNumber: 'JOB-250524-005',
    customerName: 'David Kiprotich',
    location: 'Kileleshwa, Nairobi',
    address: 'Kandara Road, Valley View Estate House 8, Kileleshwa',
    timeRange: '7:00 AM – 8:15 AM',
    status: 'completed',
    statusLabel: 'Completed',
    title: 'Distribution Board Safety Breaker Replacement',
    description: 'Diagnosed intermittent RCD nuisance tripping in master wing. Replaced aging 40A 30mA residual current device.',
    phone: '+254 721 778 899',
    latitude: -1.2780,
    longitude: 36.7910,
    priceKes: 7200,
    checklist: [
      { id: 'c1', label: 'Perform insulation resistance test', done: true },
      { id: 'c2', label: 'Replace 40A RCD module', done: true },
      { id: 'c3', label: 'Verify trip time at 1x and 5x IΔn', done: true }
    ],
    photos: [],
    materials: [
      { id: 'm1', name: 'Schneider 40A 2P 30mA RCD', qty: 1, unitPrice: 3800 }
    ],
    signature: {
      signerName: 'David Kiprotich',
      timestamp: '2025-05-24 08:12 AM',
      dataUrl: ''
    }
  }
];

export const MobileApkTodayJobsView: React.FC = () => {
  const { showToast, currentUser, setUserProfileModalOpen, uploadCurrentUserAvatar } = useApp();

  // Active Bottom Nav Tab inside the mobile app
  const [mobileNavTab, setMobileNavTab] = useState<'home' | 'jobs' | 'map' | 'profile'>('home');

  // Active Screen: Live Tracking (vwnwt.jpg) vs Job Detail (thWmW.jpg) vs Today's Jobs (Ci01L.jpg) vs Job Completion (ZMesm.jpg)
  const [activeScreen, setActiveScreen] = useState<'live_tracking' | 'today_dashboard' | 'job_detail' | 'job_completion'>('job_completion');

  // Filter mode when clicking metrics cards
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'en_route' | 'completed'>('all');

  // List of jobs
  const [jobs, setJobs] = useState<MobileJobItem[]>(INITIAL_MOBILE_JOBS);

  // Fetch live active jobs from API
  useEffect(() => {
    let isMounted = true;
    api.getJobs({ scope: 'today_active' })
      .then(liveJobs => {
        if (!isMounted || !liveJobs || liveJobs.length === 0) return;
        setJobs(prev => {
          const map = new Map<string, MobileJobItem>();
          for (const item of prev) {
            map.set(item.jobNumber, item);
          }
          for (const j of liveJobs) {
            let status: MobileJobItem['status'] = 'in_progress';
            let statusLabel = 'In Progress';
            if (j.status === 'en_route') {
              status = 'en_route';
              statusLabel = 'En Route';
            } else if (j.status === 'on_site') {
              status = 'on_site';
              statusLabel = 'On Site';
            } else if (j.status === 'completed') {
              status = 'completed';
              statusLabel = 'Completed';
            } else if (j.status === 'scheduled' || j.status === 'assigned' || j.status === 'new') {
              status = 'in_progress';
              statusLabel = 'Scheduled';
            }

            const existing = map.get(j.jobNumber);
            map.set(j.jobNumber, {
              id: j.id,
              jobNumber: j.jobNumber,
              customerName: (j as any).customer?.name || existing?.customerName || 'Commercial Client',
              location: (j as any).customer?.county || existing?.location || 'Nairobi Central',
              address: (j as any).customer?.address || existing?.address || 'Nairobi',
              timeRange: j.startTime ? `${j.startTime} – ${j.endTime || '17:00'}` : (existing?.timeRange || 'Today'),
              status: existing ? existing.status : status,
              statusLabel: existing ? existing.statusLabel : statusLabel,
              title: j.title,
              description: j.description || existing?.description || 'Field service work order.',
              phone: (j as any).customer?.phone || existing?.phone || '0712 345 678',
              latitude: j.checkInLat || existing?.latitude || -1.2635,
              longitude: j.checkInLng || existing?.longitude || 36.8020,
              priceKes: existing?.priceKes || 8500,
              checklist: existing?.checklist || (j.checklist?.map(c => ({ id: c.id, label: (c as any).label || (c as any).title || 'Task', done: Boolean(c.completed || (c as any).checked) })) || []),
              photos: existing?.photos || [],
              materials: existing?.materials || (j.materials?.map(m => ({ id: m.id, name: m.name, qty: m.quantity, unitPrice: m.unitPrice })) || []),
            });
          }
          return Array.from(map.values());
        });
      })
      .catch(err => console.warn('Mobile jobs live load note:', err));

    return () => {
      isMounted = false;
    };
  }, []);

  // Selected job for detailed on-site execution
  const [selectedJob, setSelectedJob] = useState<MobileJobItem | null>(null);

  // Signature pad modal state
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);

  // Call modal state
  const [callModalJob, setCallModalJob] = useState<MobileJobItem | null>(null);

  // New material modal state
  const [materialModalOpen, setMaterialModalOpen] = useState(false);
  const [newMaterialName, setNewMaterialName] = useState('');
  const [newMaterialQty, setNewMaterialQty] = useState(1);
  const [newMaterialPrice, setNewMaterialPrice] = useState(1500);

  // Frame presentation mode: Phone bezel vs full screen
  const [frameMode, setFrameMode] = useState<boolean>(true);

  // File upload input ref for technician mobile avatar upload
  const mobileFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Dynamic technician profile connected to currentUser
  const technicianProfile = {
    name: currentUser?.name || 'John Mwangi',
    role: currentUser?.role ? `${currentUser.role.toUpperCase()} · Field Specialist` : 'Lead Field Specialist',
    vehicleReg: 'KDL 812B (Toyota Probox)',
    batteryPct: 61,
    avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    online: true,
    nairobiBranch: 'Nairobi Central & Westlands',
    todayDate: 'Today (EAT)',
    activeJobsCount: jobs.filter(j => j.status === 'en_route' || j.status === 'on_site' || j.status === 'in_progress').length,
    enRouteCount: jobs.filter(j => j.status === 'en_route').length,
    completedTodayCount: jobs.filter(j => j.status === 'completed').length,
  };

  const handleMobileAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'warning');
      return;
    }

    setIsUploadingPhoto(true);
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const size = Math.min(img.width, img.height);
        canvas.width = 360;
        canvas.height = 360;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const sx = (img.width - size) / 2;
          const sy = (img.height - size) / 2;
          ctx.drawImage(img, sx, sy, size, size, 0, 0, 360, 360);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
          await uploadCurrentUserAvatar(dataUrl);
          showToast('Profile picture uploaded successfully!', 'success');
        }
        setIsUploadingPhoto(false);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Filtered jobs list based on filter pill / metric selection
  const filteredJobs = jobs.filter(job => {
    if (activeFilter === 'all') {
      // Default Today's Jobs view shows the 3 active jobs as in screenshot Ci01L.jpg
      return job.status === 'en_route' || job.status === 'on_site' || job.status === 'in_progress';
    }
    if (activeFilter === 'active') {
      return job.status === 'en_route' || job.status === 'on_site' || job.status === 'in_progress';
    }
    if (activeFilter === 'en_route') {
      return job.status === 'en_route';
    }
    if (activeFilter === 'completed') {
      return job.status === 'completed';
    }
    return true;
  });

  // Action handlers matching native mobile intents
  const handleNavigate = (job: MobileJobItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const query = encodeURIComponent(`${job.customerName}, ${job.address}`);
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${job.latitude},${job.longitude}&query=${query}`;
    showToast(`Launching GPS Navigation to ${job.location}...`, 'info');
    try {
      window.open(mapsUrl, '_blank', 'noopener,noreferrer');
    } catch {
      showToast('Maps navigation link prepared. Please allow popups if blocked.', 'info');
    }
  };

  const handleCall = (job: MobileJobItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCallModalJob(job);
  };

  const handleConfirmDial = (phone: string) => {
    showToast(`Initiating call to ${phone}...`, 'success');
    window.location.href = `tel:${phone.replace(/\s+/g, '')}`;
    setCallModalJob(null);
  };

  const handleWhatsApp = (job: MobileJobItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const cleanPhone = job.phone.replace(/[^0-9]/g, '');
    const greeting = `Habari ${job.customerName}! This is ${technicianProfile.name} from Fieldnora. I am currently attending to your work order ${job.jobNumber} (${job.title}) at ${job.location}. Please let me know if you need any specific updates.`;
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(greeting)}`;
    showToast(`Opening WhatsApp dispatch chat for ${job.customerName}...`, 'success');
    try {
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    } catch {
      showToast('WhatsApp link prepared. Please allow popups if blocked.', 'info');
    }
  };

  // Status transitions inside Job Detail
  const handleUpdateStatus = (jobId: string, newStatus: MobileJobItem['status']) => {
    const statusLabels: Record<MobileJobItem['status'], string> = {
      scheduled: 'Scheduled',
      en_route: 'En Route',
      on_site: 'On Site',
      in_progress: 'In Progress',
      completed: 'Completed'
    };

    setJobs(prev =>
      prev.map(j => (j.id === jobId ? { ...j, status: newStatus, statusLabel: statusLabels[newStatus] } : j))
    );
    if (selectedJob && selectedJob.id === jobId) {
      setSelectedJob(prev => (prev ? { ...prev, status: newStatus, statusLabel: statusLabels[newStatus] } : null));
    }
    showToast(`Work order status updated to ${statusLabels[newStatus]}!`, 'success');
  };

  // Toggle checklist item
  const handleToggleChecklist = (jobId: string, checkId: string) => {
    setJobs(prev =>
      prev.map(j => {
        if (j.id !== jobId) return j;
        const updatedList = j.checklist.map(c => (c.id === checkId ? { ...c, done: !c.done } : c));
        return { ...j, checklist: updatedList };
      })
    );
    if (selectedJob && selectedJob.id === jobId) {
      setSelectedJob(prev => {
        if (!prev) return null;
        const updatedList = prev.checklist.map(c => (c.id === checkId ? { ...c, done: !c.done } : c));
        return { ...prev, checklist: updatedList };
      });
    }
  };

  // Add material
  const handleAddMaterialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob || !newMaterialName.trim()) return;

    const newItem = {
      id: `mat-${Date.now()}`,
      name: newMaterialName.trim(),
      qty: Number(newMaterialQty),
      unitPrice: Number(newMaterialPrice)
    };

    setJobs(prev =>
      prev.map(j => {
        if (j.id !== selectedJob.id) return j;
        return { ...j, materials: [...j.materials, newItem], priceKes: j.priceKes + newItem.qty * newItem.unitPrice };
      })
    );

    setSelectedJob(prev => {
      if (!prev) return null;
      return {
        ...prev,
        materials: [...prev.materials, newItem],
        priceKes: prev.priceKes + newItem.qty * newItem.unitPrice
      };
    });

    setMaterialModalOpen(false);
    setNewMaterialName('');
    showToast(`Added ${newItem.qty}x ${newItem.name} to work order`, 'success');
  };

  // Save Signature
  const handleSaveSignature = (dataUrl: string) => {
    if (!selectedJob) return;
    const sig = {
      signerName: selectedJob.customerName,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dataUrl
    };

    setJobs(prev =>
      prev.map(j => (j.id === selectedJob.id ? { ...j, status: 'completed', statusLabel: 'Completed', signature: sig } : j))
    );
    setSelectedJob(prev => (prev ? { ...prev, status: 'completed', statusLabel: 'Completed', signature: sig } : null));
    setSignatureModalOpen(false);
    showToast('Customer signature captured and sealed! Work order completed.', 'success');
  };

  return (
    <div className="space-y-4 pb-12 text-slate-100">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0F1722] p-4 rounded-2xl border border-[#1E293B]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0D2E2B] border border-[#14B8A6]/40 flex items-center justify-center text-[#14B8A6]">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">Mobile APK – Today's Jobs Dashboard</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0D2E2B] text-[#14B8A6] border border-[#14B8A6]/40">
                Android APK UI/UX
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Pixel-perfect mobile application interface matching Fieldnora Android APK build.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Screen Tab Switcher between vwnwt.jpg, thWmW.jpg and Ci01L.jpg */}
          <div className="flex items-center bg-[#0B1118] p-1 rounded-xl border border-[#1E293B] text-xs">
            <button
              onClick={() => {
                setActiveScreen('live_tracking');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeScreen === 'live_tracking'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Navigation className="w-3.5 h-3.5 transform rotate-45" />
              <span>Live Map (vwnwt.jpg)</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-900/60 text-blue-200 border border-blue-400/30">
                Live GPS
              </span>
            </button>
            <button
              onClick={() => {
                setActiveScreen('job_detail');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeScreen === 'job_detail'
                  ? 'bg-[#14B8A6] text-[#091017] shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Job Detail (thWmW.jpg)</span>
            </button>
            <button
              onClick={() => {
                setActiveScreen('today_dashboard');
                setSelectedJob(null);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeScreen === 'today_dashboard'
                  ? 'bg-[#14B8A6] text-[#091017] shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Today's Jobs (Ci01L.jpg)</span>
            </button>
            <button
              onClick={() => {
                setActiveScreen('job_completion');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeScreen === 'job_completion'
                  ? 'bg-[#16A34A] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Job Completion (ZMesm.jpg)</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-white/20 rounded font-black uppercase">Sign-Off</span>
            </button>
          </div>

          {activeScreen === 'today_dashboard' && (
            <div className="flex items-center bg-[#0B1118] p-1 rounded-xl border border-[#1E293B] text-xs">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  activeFilter === 'all' ? 'bg-[#14B8A6] text-[#091017] font-bold shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Today's 4
              </button>
              <button
                onClick={() => setActiveFilter('en_route')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  activeFilter === 'en_route' ? 'bg-[#14B8A6] text-[#091017] font-bold shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                En Route (1)
              </button>
              <button
                onClick={() => setActiveFilter('completed')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  activeFilter === 'completed' ? 'bg-[#14B8A6] text-[#091017] font-bold shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Completed (2)
              </button>
            </div>
          )}

          <button
            onClick={() => setFrameMode(!frameMode)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#131B24] border border-[#1E293B] hover:border-[#14B8A6]/50 text-slate-200 transition-colors"
          >
            {frameMode ? <Maximize2 className="w-3.5 h-3.5 text-[#14B8A6]" /> : <Minimize2 className="w-3.5 h-3.5 text-[#14B8A6]" />}
            <span>{frameMode ? 'Full View' : 'Phone Frame'}</span>
          </button>
        </div>
      </div>

      {/* Screen Render: Live Tracking (vwnwt.jpg) vs Job Detail (thWmW.jpg) vs Today's Jobs (Ci01L.jpg) */}
      {activeScreen === 'live_tracking' ? (
        <div className="flex justify-center py-2">
          <MobileLiveTrackingView
            jobNumber={selectedJob?.jobNumber || 'JOB-2025-0587'}
            customerName={selectedJob?.customerName || 'Peter Mwangi'}
            jobTitle={selectedJob?.title || 'Water Heater Repair'}
            destinationAddress={selectedJob?.address || 'Apartment5B, Riverside Drive, Nairobi'}
            destinationArea={selectedJob?.location || 'Nairobi CBD'}
            onBack={() => setActiveScreen('today_dashboard')}
            onViewJobDetails={() => setActiveScreen('job_detail')}
          />
        </div>
      ) : activeScreen === 'job_detail' ? (
        <div className="flex justify-center py-2">
          <MobileJobDetailScreen
            initialJobNumber={selectedJob?.jobNumber || 'JOB-2025-0587'}
            onBack={() => {
              setSelectedJob(null);
              setActiveScreen('today_dashboard');
            }}
            onOpenLiveTracking={() => setActiveScreen('live_tracking')}
          />
        </div>
      ) : activeScreen === 'job_completion' ? (
        <div className="flex justify-center py-2">
          <MobileJobCompletionScreen
            jobNumber={selectedJob?.jobNumber || '#FN-2400-0897'}
            customerName={selectedJob?.customerName || 'John Mwangi'}
            totalKes={selectedJob ? selectedJob.priceKes : 4300}
            onBack={() => {
              setActiveScreen('today_dashboard');
            }}
            onJobSynced={() => {
              if (selectedJob) {
                handleSaveSignature('data:image/svg+xml;base64,presigned');
              }
              setActiveScreen('today_dashboard');
            }}
          />
        </div>
      ) : (
      /* Main Container: Android Phone Mockup vs Full Screen */
      <div className={`flex justify-center ${frameMode ? 'py-2 sm:py-6' : ''}`}>
        <div
          className={`w-full bg-[#080D14] text-slate-100 flex flex-col transition-all duration-300 ${
            frameMode
              ? 'max-w-[420px] rounded-[48px] border-[10px] border-[#131B26] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden min-h-[820px] max-h-[880px]'
              : 'rounded-2xl border border-[#1E293B] min-h-[780px]'
          }`}
        >
          {/* ========================================================= */}
          {/* 1. ANDROID STATUS BAR (Matches 07:42, 1, Signal, 61% from Ci01L.jpg) */}
          {/* ========================================================= */}
          <div className="bg-[#080D14] px-6 pt-3 pb-1.5 flex items-center justify-between text-xs text-slate-300 font-sans select-none shrink-0 z-10">
            {/* Left: Time and navigation arrow indicator */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-[13px] tracking-tight text-white">07:42</span>
              <Navigation className="w-3 h-3 text-slate-300 fill-slate-300 transform -rotate-45" />
            </div>

            {/* Center camera punch-hole notch */}
            <div className="w-3.5 h-3.5 rounded-full bg-[#040608] border border-[#1A2533] mx-auto shadow-inner" />

            {/* Right: Network signals & 61% Battery */}
            <div className="flex items-center gap-2 text-slate-300">
              <div className="flex items-end gap-0.5 h-3.5">
                <span className="w-1 h-1.5 bg-slate-300 rounded-xs" />
                <span className="w-1 h-2 bg-slate-300 rounded-xs" />
                <span className="w-1 h-2.5 bg-slate-300 rounded-xs" />
                <span className="w-1 h-3.5 bg-slate-300 rounded-xs" />
              </div>
              <Wifi className="w-3.5 h-3.5 text-slate-300" />
              <div className="flex items-center gap-1 font-semibold text-[12px] text-white">
                <div className="w-5 h-2.5 rounded-xs border border-slate-300 p-0.5 flex items-center">
                  <div className="w-[61%] h-full bg-slate-200 rounded-2xs" />
                </div>
                <span>61%</span>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 2. FIELDNORA MOBILE APP HEADER (Exact match from Ci01L.jpg) */}
          {/* ========================================================= */}
          <div className="bg-[#080D14] px-5 pt-2 pb-3 flex items-center justify-between border-b border-[#141E2B]/60 shrink-0">
            {/* Left: Fieldnora Logo + Name */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setMobileNavTab('home')}>
              <FieldnoraAppLogo className="w-6 h-6 shrink-0" />
              <span className="font-bold text-[19px] tracking-tight text-white">Fieldnora</span>
            </div>

            {/* Center: "Today" and Date */}
            <div className="text-center">
              <h2 className="text-[15px] font-bold text-white leading-tight">Today</h2>
              <span className="text-[12px] text-slate-400 font-medium block">
                {technicianProfile.todayDate}
              </span>
            </div>

            {/* Right: Technician Avatar with Green Online Dot */}
            <div
              className="relative cursor-pointer group"
              onClick={() => setMobileNavTab('profile')}
              title={`Logged in as ${technicianProfile.name}`}
            >
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#1E293B] group-hover:border-[#14B8A6] transition-colors">
                <img
                  src={technicianProfile.avatar}
                  alt={technicianProfile.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Vibrant green online dot */}
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#10B981] rounded-full border-2 border-[#080D14]" />
            </div>
          </div>

          {/* ========================================================= */}
          {/* 3. SCROLLABLE SCREEN CONTENT CANVAS */}
          {/* ========================================================= */}
          <div className="flex-1 overflow-y-auto bg-[#080D14] px-4 py-4 space-y-4 text-xs scrollbar-thin scrollbar-thumb-slate-800">
            {/* TAB 1: HOME (THE EXACT SCREENSHOT CI01L.JPG) */}
            {mobileNavTab === 'home' && !selectedJob && (
              <div className="space-y-4">
                {/* 3 METRICS CARDS ROW */}
                <div className="grid grid-cols-3 gap-2.5">
                  {/* Card 1: 3 Active Jobs */}
                  <div
                    onClick={() => setActiveFilter(activeFilter === 'active' ? 'all' : 'active')}
                    className={`bg-[#0F1622] p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-[86px] ${
                      activeFilter === 'active'
                        ? 'border-[#14B8A6] ring-1 ring-[#14B8A6]/40 bg-[#121B28]'
                        : 'border-[#1B2736] hover:border-[#14B8A6]/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#0D282A] text-[#14B8A6] flex items-center justify-center shrink-0">
                        <Briefcase className="w-4.5 h-4.5 text-[#14B8A6]" />
                      </div>
                      <span className="text-2xl font-bold text-white tracking-tight leading-none">3</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium truncate mt-1">Active Jobs</span>
                  </div>

                  {/* Card 2: 1 En Route */}
                  <div
                    onClick={() => setActiveFilter(activeFilter === 'en_route' ? 'all' : 'en_route')}
                    className={`bg-[#0F1622] p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-[86px] ${
                      activeFilter === 'en_route'
                        ? 'border-[#14B8A6] ring-1 ring-[#14B8A6]/40 bg-[#121B28]'
                        : 'border-[#1B2736] hover:border-[#14B8A6]/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 flex items-center justify-center shrink-0">
                        <Navigation className="w-6 h-6 text-[#14B8A6] fill-[#14B8A6] transform -rotate-45" />
                      </div>
                      <span className="text-2xl font-bold text-white tracking-tight leading-none">1</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium truncate mt-1">En Route</span>
                  </div>

                  {/* Card 3: 2 Completed today */}
                  <div
                    onClick={() => setActiveFilter(activeFilter === 'completed' ? 'all' : 'completed')}
                    className={`bg-[#0F1622] p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-[86px] ${
                      activeFilter === 'completed'
                        ? 'border-[#14B8A6] ring-1 ring-[#14B8A6]/40 bg-[#121B28]'
                        : 'border-[#1B2736] hover:border-[#14B8A6]/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-6 h-6 text-[#14B8A6]" />
                      </div>
                      <span className="text-2xl font-bold text-white tracking-tight leading-none">2</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium truncate mt-1">Completed today</span>
                  </div>
                </div>

                {/* SECTION HEADER: Today's Jobs + Count */}
                <div className="flex items-center justify-between pt-1">
                  <h3 className="text-[16px] font-bold text-white tracking-tight">Today's Jobs</h3>
                  <span className="text-[13px] text-slate-400 font-normal">
                    {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'}
                  </span>
                </div>

                {/* JOBS LIST - MATCHING CI01L.JPG EXACT STYLING */}
                <div className="space-y-3.5">
                  {filteredJobs.map(job => (
                    <div
                      key={job.id}
                      onClick={() => {
                        setSelectedJob(job);
                        setActiveScreen('job_detail');
                      }}
                      className="bg-[#0F1622] rounded-2xl border border-[#1A2635] hover:border-[#14B8A6]/50 transition-all cursor-pointer p-4 space-y-3 shadow-xs group"
                    >
                      {/* Top Row: Job Number + Status Badge */}
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[14px] text-[#14B8A6] tracking-wide">
                          {job.jobNumber}
                        </span>

                        {/* Status Badge */}
                        {job.status === 'en_route' && (
                          <div className="px-2.5 py-1 rounded-full bg-[#0A292D] text-[#14B8A6] border border-[#14B8A6]/20 flex items-center gap-1.5 text-[11px] font-semibold">
                            <Navigation className="w-3 h-3 text-[#14B8A6] fill-[#14B8A6] transform -rotate-45" />
                            <span>En Route</span>
                          </div>
                        )}

                        {job.status === 'on_site' && (
                          <div className="px-2.5 py-1 rounded-full bg-[#0A292D] text-[#14B8A6] border border-[#14B8A6]/20 flex items-center gap-1.5 text-[11px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6]" />
                            <span>On Site</span>
                          </div>
                        )}

                        {job.status === 'in_progress' && (
                          <div className="px-2.5 py-1 rounded-full bg-[#16212E] text-slate-300 border border-slate-700/60 flex items-center gap-1.5 text-[11px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            <span>In Progress</span>
                          </div>
                        )}

                        {job.status === 'completed' && (
                          <div className="px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 flex items-center gap-1.5 text-[11px] font-semibold">
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Completed</span>
                          </div>
                        )}
                      </div>

                      {/* Customer Name */}
                      <div>
                        <h4 className="text-[16px] font-bold text-white tracking-tight leading-snug group-hover:text-teal-200 transition-colors">
                          {job.customerName}
                        </h4>
                        <div className="flex items-center gap-1 text-[12px] text-slate-400 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{job.location}</span>
                        </div>
                      </div>

                      {/* Thin Hairline Divider */}
                      <div className="border-t border-[#182330]" />

                      {/* Time Schedule Row */}
                      <div className="flex items-center gap-1.5 text-[12px] text-slate-300 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{job.timeRange}</span>
                      </div>

                      {/* 3 Action Buttons Grid: Navigate | Call | WhatsApp */}
                      <div className="grid grid-cols-3 gap-2 pt-0.5" onClick={e => e.stopPropagation()}>
                        {/* Navigate Button */}
                        <button
                          type="button"
                          onClick={e => handleNavigate(job, e)}
                          className="bg-[#0C131D] hover:bg-[#141E2B] active:bg-[#1A2536] border border-[#1E2C3D] hover:border-[#14B8A6]/50 rounded-xl py-2.5 px-2 flex items-center justify-center gap-1.5 text-[13px] font-semibold text-white transition-all shadow-2xs"
                        >
                          <Navigation className="w-3.5 h-3.5 text-[#14B8A6] fill-[#14B8A6] transform -rotate-45" />
                          <span>Navigate</span>
                        </button>

                        {/* Call Button */}
                        <button
                          type="button"
                          onClick={e => handleCall(job, e)}
                          className="bg-[#0C131D] hover:bg-[#141E2B] active:bg-[#1A2536] border border-[#1E2C3D] hover:border-[#14B8A6]/50 rounded-xl py-2.5 px-2 flex items-center justify-center gap-1.5 text-[13px] font-semibold text-white transition-all shadow-2xs"
                        >
                          <Phone className="w-3.5 h-3.5 text-[#14B8A6] fill-[#14B8A6]" />
                          <span>Call</span>
                        </button>

                        {/* WhatsApp Button */}
                        <button
                          type="button"
                          onClick={e => handleWhatsApp(job, e)}
                          className="bg-[#0C131D] hover:bg-[#141E2B] active:bg-[#1A2536] border border-[#1E2C3D] hover:border-emerald-500/50 rounded-xl py-2.5 px-2 flex items-center justify-center gap-1.5 text-[13px] font-semibold text-white transition-all shadow-2xs"
                        >
                          <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
                          <span>WhatsApp</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {filteredJobs.length === 0 && (
                    <div className="p-8 text-center bg-[#0F1622] rounded-2xl border border-[#1A2635] space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-teal-400 mx-auto" />
                      <h4 className="text-sm font-bold text-white">No jobs in this category</h4>
                      <p className="text-xs text-slate-400">
                        Tap "Today's 3" above to view active dispatched work orders.
                      </p>
                      <button
                        onClick={() => setActiveFilter('all')}
                        className="mt-2 px-3 py-1.5 rounded-lg bg-[#14B8A6] text-[#091017] font-bold text-xs"
                      >
                        Reset Filter
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SELECTED JOB ON-SITE EXECUTION DOSSIER */}
            {selectedJob && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Back to Today's Jobs Button */}
                <button
                  onClick={() => setSelectedJob(null)}
                  className="flex items-center gap-1.5 text-[12px] font-bold text-[#14B8A6] hover:text-teal-300 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Today's Jobs</span>
                </button>

                {/* Job Dossier Header */}
                <div className="bg-[#0F1622] p-4 rounded-2xl border border-[#1E2C3D] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-[#14B8A6]">{selectedJob.jobNumber}</span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-[#0A292D] text-[#14B8A6] border border-[#14B8A6]/30">
                      {selectedJob.statusLabel}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white leading-tight">{selectedJob.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{selectedJob.description}</p>
                  </div>

                  {/* Customer Information Box */}
                  <div className="bg-[#080D14] p-3 rounded-xl border border-[#1A2635] space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Customer:</span>
                      <span className="font-bold text-white">{selectedJob.customerName}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Phone:</span>
                      <span className="font-mono font-semibold text-teal-400">{selectedJob.phone}</span>
                    </div>
                    <div className="flex items-start justify-between text-xs pt-1 border-t border-[#16212E]">
                      <span className="text-slate-400 shrink-0">Site Address:</span>
                      <span className="text-right text-slate-300 ml-2">{selectedJob.address}</span>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button
                      onClick={() => handleNavigate(selectedJob)}
                      className="bg-[#141F2D] hover:bg-[#1A283A] text-white py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-[#1E2E40]"
                    >
                      <Navigation className="w-3.5 h-3.5 text-[#14B8A6] fill-[#14B8A6] transform -rotate-45" />
                      <span>GPS Maps</span>
                    </button>
                    <button
                      onClick={() => handleCall(selectedJob)}
                      className="bg-[#141F2D] hover:bg-[#1A283A] text-white py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-[#1E2E40]"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#14B8A6] fill-[#14B8A6]" />
                      <span>Call Client</span>
                    </button>
                    <button
                      onClick={() => handleWhatsApp(selectedJob)}
                      className="bg-[#141F2D] hover:bg-[#1A283A] text-white py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-[#1E2E40]"
                    >
                      <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>

                {/* Workflow Status Progression Stepper */}
                <div className="bg-[#0F1622] p-4 rounded-2xl border border-[#1E2C3D] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Update Dispatch Status
                    </span>
                    <span className="text-[11px] text-teal-400 font-semibold font-mono">
                      Current: {selectedJob.statusLabel}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleUpdateStatus(selectedJob.id, 'en_route')}
                      className={`py-2 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 border transition-all ${
                        selectedJob.status === 'en_route'
                          ? 'bg-[#14B8A6] text-[#091017] border-[#14B8A6]'
                          : 'bg-[#080D14] text-slate-300 border-[#1B2736] hover:border-teal-500'
                      }`}
                    >
                      <Navigation className="w-3 h-3 transform -rotate-45" />
                      <span>En Route</span>
                    </button>

                    <button
                      onClick={() => handleUpdateStatus(selectedJob.id, 'on_site')}
                      className={`py-2 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 border transition-all ${
                        selectedJob.status === 'on_site'
                          ? 'bg-[#14B8A6] text-[#091017] border-[#14B8A6]'
                          : 'bg-[#080D14] text-slate-300 border-[#1B2736] hover:border-teal-500'
                      }`}
                    >
                      <MapPin className="w-3 h-3" />
                      <span>On Site</span>
                    </button>

                    <button
                      onClick={() => handleUpdateStatus(selectedJob.id, 'in_progress')}
                      className={`py-2 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 border transition-all ${
                        selectedJob.status === 'in_progress'
                          ? 'bg-[#14B8A6] text-[#091017] border-[#14B8A6]'
                          : 'bg-[#080D14] text-slate-300 border-[#1B2736] hover:border-teal-500'
                      }`}
                    >
                      <Briefcase className="w-3 h-3" />
                      <span>In Progress</span>
                    </button>
                  </div>
                </div>

                {/* Interactive Task Checklist */}
                <div className="bg-[#0F1622] p-4 rounded-2xl border border-[#1E2C3D] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-[#14B8A6]" />
                      Technical Task Checklist
                    </span>
                    <span className="text-xs font-mono font-bold text-teal-400">
                      {selectedJob.checklist.filter(c => c.done).length} / {selectedJob.checklist.length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {selectedJob.checklist.map(item => (
                      <div
                        key={item.id}
                        onClick={() => handleToggleChecklist(selectedJob.id, item.id)}
                        className={`p-2.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                          item.done
                            ? 'bg-[#0A292D]/40 border-[#14B8A6]/40 text-slate-200'
                            : 'bg-[#080D14] border-[#1B2736] text-slate-400 hover:text-white'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors ${
                            item.done ? 'bg-[#14B8A6] text-[#080D14]' : 'border border-slate-600 bg-slate-900'
                          }`}
                        >
                          {item.done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className={`text-xs ${item.done ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Materials & Parts Used */}
                <div className="bg-[#0F1622] p-4 rounded-2xl border border-[#1E2C3D] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Van Stock &amp; Materials Used
                    </span>
                    <button
                      onClick={() => setMaterialModalOpen(true)}
                      className="text-xs font-bold text-[#14B8A6] hover:text-teal-300 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Part
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {selectedJob.materials.map(m => (
                      <div
                        key={m.id}
                        className="bg-[#080D14] p-2.5 rounded-xl border border-[#1B2736] flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-semibold text-white">{m.name}</div>
                          <div className="text-[11px] text-slate-400">Qty: {m.qty} × KES {m.unitPrice.toLocaleString()}</div>
                        </div>
                        <span className="font-mono font-bold text-teal-400">
                          KES {(m.qty * m.unitPrice).toLocaleString()}
                        </span>
                      </div>
                    ))}

                    <div className="pt-2 border-t border-[#182330] flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">Estimated Work Order Total:</span>
                      <span className="text-sm font-mono font-bold text-[#14B8A6]">
                        KES {selectedJob.priceKes.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Customer Sign-off Signature */}
                <div className="bg-[#0F1622] p-4 rounded-2xl border border-[#1E2C3D] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-[#14B8A6]" />
                      Customer Digital Sign-Off
                    </span>
                    {selectedJob.signature && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                        Signed
                      </span>
                    )}
                  </div>

                  {selectedJob.signature ? (
                    <div className="bg-[#080D14] p-3 rounded-xl border border-emerald-800/40 text-xs space-y-1">
                      <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        Signature accepted by {selectedJob.signature.signerName}
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        Recorded on-site at {selectedJob.signature.timestamp} with GPS verification.
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveScreen('job_completion')}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-[#16A34A] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-green-600/20 hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer"
                    >
                      <FileCheck className="w-4 h-4" />
                      Capture Customer Touch Signature & Complete Job
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: ALL JOBS LIST */}
            {mobileNavTab === 'jobs' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white tracking-tight">Assigned Work Orders</h3>
                  <span className="text-xs text-slate-400">{jobs.length} Total</span>
                </div>

                <div className="space-y-2.5">
                  {jobs.map(j => (
                    <div
                      key={j.id}
                      onClick={() => {
                        setSelectedJob(j);
                        setMobileNavTab('home');
                      }}
                      className="bg-[#0F1622] p-3.5 rounded-xl border border-[#1A2635] hover:border-[#14B8A6]/50 transition-colors cursor-pointer space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-[#14B8A6]">{j.jobNumber}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0A292D] text-[#14B8A6]">
                          {j.statusLabel}
                        </span>
                      </div>
                      <div className="font-bold text-white text-xs leading-snug">{j.title}</div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-[#16212E]">
                        <span>📍 {j.location}</span>
                        <span className="font-mono text-teal-400 font-semibold">KES {j.priceKes.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: LIVE MOBILE GPS MAP */}
            {mobileNavTab === 'map' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white tracking-tight">Nairobi Metro Route Map</h3>
                  <span className="text-xs text-teal-400 font-mono">GPS 🟢 Active</span>
                </div>

                <div className="bg-[#0A1017] rounded-2xl border border-[#1A2635] p-3 space-y-3">
                  {/* Cartographic visual representation */}
                  <div className="relative h-56 bg-[#04070B] rounded-xl overflow-hidden border border-[#182330] flex items-center justify-center">
                    {/* Grid lines */}
                    <div
                      className="absolute inset-0 opacity-15"
                      style={{
                        backgroundImage: `radial-gradient(#14B8A6 1px, transparent 1px)`,
                        backgroundSize: '20px 20px'
                      }}
                    />

                    {/* Arterial Road Paths */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      <path
                        d="M 20 40 Q 120 70 200 110 T 360 180"
                        stroke="#1E2E42"
                        strokeWidth="5"
                        fill="none"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 80 20 L 150 120 L 290 200"
                        stroke="#1E2E42"
                        strokeWidth="3.5"
                        fill="none"
                      />
                      {/* En Route glowing path */}
                      <path
                        d="M 120 90 Q 180 100 240 70"
                        stroke="#14B8A6"
                        strokeWidth="3"
                        strokeDasharray="5,4"
                        fill="none"
                      />
                    </svg>

                    {/* Markers for the 3 Today's Jobs */}
                    {/* Marker 1: Lavington (En Route) */}
                    <div className="absolute top-[35%] left-[30%] flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full bg-[#14B8A6] text-black font-bold text-[10px] flex items-center justify-center shadow-lg shadow-[#14B8A6]/40 animate-pulse">
                        1
                      </div>
                      <span className="text-[9px] font-bold bg-slate-900/90 text-teal-300 px-1 rounded mt-0.5 whitespace-nowrap">
                        Lavington (En Route)
                      </span>
                    </div>

                    {/* Marker 2: Westlands (On Site) */}
                    <div className="absolute top-[25%] left-[62%] flex flex-col items-center">
                      <div className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold text-[9px] flex items-center justify-center shadow-md">
                        2
                      </div>
                      <span className="text-[9px] font-semibold bg-slate-900/90 text-slate-300 px-1 rounded mt-0.5 whitespace-nowrap">
                        Westlands
                      </span>
                    </div>

                    {/* Marker 3: Embakasi (In Progress) */}
                    <div className="absolute top-[68%] left-[75%] flex flex-col items-center">
                      <div className="w-5 h-5 rounded-full bg-slate-700 text-white font-bold text-[9px] flex items-center justify-center">
                        3
                      </div>
                      <span className="text-[9px] font-semibold bg-slate-900/90 text-slate-300 px-1 rounded mt-0.5 whitespace-nowrap">
                        Embakasi
                      </span>
                    </div>

                    {/* Technician Location Pin */}
                    <div className="absolute top-[48%] left-[45%] flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center ring-4 ring-blue-500/30">
                        <Navigation className="w-3.5 h-3.5 fill-white" />
                      </div>
                      <span className="text-[9px] font-bold bg-blue-950 text-blue-300 px-1.5 py-0.5 rounded-full mt-0.5 border border-blue-800">
                        John Mwangi (Van)
                      </span>
                    </div>
                  </div>

                  {/* Route Summary */}
                  <div className="p-3 bg-[#080D14] rounded-xl border border-[#16212E] space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Next Stop:</span>
                      <span className="font-bold text-white">Lavington Green Villa 14</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Estimated Arrival:</span>
                      <span className="font-bold text-teal-400">14 mins (Waiyaki Way traffic light)</span>
                    </div>
                    <button
                      onClick={() => handleNavigate(INITIAL_MOBILE_JOBS[0])}
                      className="w-full mt-2 py-2 bg-[#14B8A6] text-[#080D14] rounded-lg font-bold text-xs flex items-center justify-center gap-1.5"
                    >
                      <Navigation className="w-3.5 h-3.5 fill-[#080D14]" />
                      Launch Turn-by-Turn Navigation
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: TECHNICIAN PROFILE */}
            {mobileNavTab === 'profile' && (
              <div className="space-y-4">
                <input
                  ref={mobileFileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  onChange={handleMobileAvatarUpload}
                />

                <div className="text-center p-4 bg-[#0F1622] rounded-2xl border border-[#1A2635] space-y-2">
                  <div
                    onClick={() => mobileFileInputRef.current?.click()}
                    className="relative w-20 h-20 rounded-full overflow-hidden mx-auto border-2 border-[#14B8A6] cursor-pointer group shadow-lg"
                    title="Tap to change profile picture"
                  >
                    <img
                      src={technicianProfile.avatar}
                      alt={technicianProfile.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity text-[10px] font-semibold gap-0.5">
                      <Camera className="w-4 h-4 text-teal-400" />
                      <span>{isUploadingPhoto ? 'Uploading...' : 'Change'}</span>
                    </div>
                  </div>

                  <div className="flex justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => mobileFileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-600/80 hover:bg-teal-600 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{isUploadingPhoto ? 'Uploading...' : 'Upload Photo'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserProfileModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-teal-400" />
                      <span>Full Profile</span>
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-white pt-1">{technicianProfile.name}</h3>
                  <p className="text-xs text-teal-400 font-semibold">{technicianProfile.role}</p>
                  <span className="inline-block text-[11px] px-2.5 py-0.5 rounded-full bg-[#0A292D] text-[#14B8A6] border border-[#14B8A6]/30">
                    🟢 Shift Active · {technicianProfile.nairobiBranch}
                  </span>
                </div>

                <div className="bg-[#0F1622] p-3.5 rounded-2xl border border-[#1A2635] space-y-2 text-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Equipment &amp; Van
                  </span>
                  <div className="flex items-center justify-between py-1 border-b border-[#16212E]">
                    <span className="text-slate-400">Vehicle Registration:</span>
                    <span className="font-mono font-bold text-white">{technicianProfile.vehicleReg}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-[#16212E]">
                    <span className="text-slate-400">Battery Level:</span>
                    <span className="font-bold text-emerald-400">{technicianProfile.batteryPct}% (Optimal)</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-400">Offline SQLite Cache:</span>
                    <span className="font-bold text-teal-400">Synced (0 pending)</span>
                  </div>
                </div>

                <button
                  onClick={() => showToast('Technician shift completed. Syncing final telemetry...', 'info')}
                  className="w-full py-2.5 rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-300 font-bold text-xs hover:bg-rose-500/20 transition-colors"
                >
                  End Shift / Logout
                </button>
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* 4. BOTTOM NAVIGATION BAR (Exact match from Ci01L.jpg) */}
          {/* ========================================================= */}
          <div className="bg-[#080D14] border-t border-[#182330] px-4 pt-1.5 pb-2 shrink-0 select-none z-10">
            <div className="grid grid-cols-4 gap-1">
              {/* Tab 1: Home (Active indicator as in screenshot) */}
              <button
                type="button"
                onClick={() => {
                  setSelectedJob(null);
                  setMobileNavTab('home');
                }}
                className="flex flex-col items-center justify-center relative py-1 group"
              >
                {/* Horizontal Teal Bar Above Icon */}
                {mobileNavTab === 'home' && (
                  <span className="w-8 h-0.5 rounded-full bg-[#14B8A6] mb-1 transition-all" />
                )}
                {mobileNavTab !== 'home' && <span className="w-8 h-0.5 mb-1 opacity-0" />}

                <Home
                  className={`w-5 h-5 transition-colors ${
                    mobileNavTab === 'home' ? 'text-[#14B8A6]' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span
                  className={`text-[11px] font-medium mt-1 ${
                    mobileNavTab === 'home' ? 'text-[#14B8A6] font-semibold' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  Home
                </span>
              </button>

              {/* Tab 2: Jobs */}
              <button
                type="button"
                onClick={() => {
                  setSelectedJob(null);
                  setMobileNavTab('jobs');
                }}
                className="flex flex-col items-center justify-center relative py-1 group"
              >
                {mobileNavTab === 'jobs' && (
                  <span className="w-8 h-0.5 rounded-full bg-[#14B8A6] mb-1 transition-all" />
                )}
                {mobileNavTab !== 'jobs' && <span className="w-8 h-0.5 mb-1 opacity-0" />}

                <ClipboardList
                  className={`w-5 h-5 transition-colors ${
                    mobileNavTab === 'jobs' ? 'text-[#14B8A6]' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span
                  className={`text-[11px] font-medium mt-1 ${
                    mobileNavTab === 'jobs' ? 'text-[#14B8A6] font-semibold' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  Jobs
                </span>
              </button>

              {/* Tab 3: Map */}
              <button
                type="button"
                onClick={() => {
                  setSelectedJob(null);
                  setMobileNavTab('map');
                  setActiveScreen('live_tracking');
                }}
                className="flex flex-col items-center justify-center relative py-1 group"
              >
                {mobileNavTab === 'map' && (
                  <span className="w-8 h-0.5 rounded-full bg-[#14B8A6] mb-1 transition-all" />
                )}
                {mobileNavTab !== 'map' && <span className="w-8 h-0.5 mb-1 opacity-0" />}

                <MapIcon
                  className={`w-5 h-5 transition-colors ${
                    mobileNavTab === 'map' ? 'text-[#14B8A6]' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span
                  className={`text-[11px] font-medium mt-1 ${
                    mobileNavTab === 'map' ? 'text-[#14B8A6] font-semibold' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  Map
                </span>
              </button>

              {/* Tab 4: Profile */}
              <button
                type="button"
                onClick={() => {
                  setSelectedJob(null);
                  setMobileNavTab('profile');
                }}
                className="flex flex-col items-center justify-center relative py-1 group"
              >
                {mobileNavTab === 'profile' && (
                  <span className="w-8 h-0.5 rounded-full bg-[#14B8A6] mb-1 transition-all" />
                )}
                {mobileNavTab !== 'profile' && <span className="w-8 h-0.5 mb-1 opacity-0" />}

                <UserIcon
                  className={`w-5 h-5 transition-colors ${
                    mobileNavTab === 'profile' ? 'text-[#14B8A6]' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span
                  className={`text-[11px] font-medium mt-1 ${
                    mobileNavTab === 'profile' ? 'text-[#14B8A6] font-semibold' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  Profile
                </span>
              </button>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 5. ANDROID SYSTEM 3-BUTTON NAVIGATION BAR (Ci01L.jpg bottom) */}
          {/* ========================================================= */}
          <div className="bg-[#05080D] py-2 px-14 flex items-center justify-between text-slate-500 shrink-0 select-none">
            {/* Back button (triangle) */}
            <button
              onClick={() => {
                if (selectedJob) setSelectedJob(null);
                else setMobileNavTab('home');
              }}
              className="p-1 hover:text-slate-300 transition-colors"
              title="Android Back"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M19 12H5m7 7l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            {/* Home button (circle) */}
            <button
              onClick={() => {
                setSelectedJob(null);
                setMobileNavTab('home');
              }}
              className="p-1 hover:text-slate-300 transition-colors"
              title="Android Home"
            >
              <div className="w-3.5 h-3.5 rounded-full border-2 border-current" />
            </button>

            {/* Recents button (square) */}
            <button
              onClick={() => showToast('Android app switcher', 'info')}
              className="p-1 hover:text-slate-300 transition-colors"
              title="Android Recents"
            >
              <div className="w-3.5 h-3.5 rounded-xs border-2 border-current" />
            </button>
          </div>
        </div>
      </div>
      )}

      {/* ========================================================= */}
      {/* MODALS: Direct Call & Customer Signature & Add Part */}
      {/* ========================================================= */}

      {/* Quick Call Action Modal */}
      {callModalJob && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0F1622] rounded-2xl border border-[#1E2C3D] p-5 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0A292D] text-[#14B8A6] flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-sm">Direct Phone Dial</h3>
              </div>
              <button
                onClick={() => setCallModalJob(null)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-[#080D14] rounded-xl border border-[#1A2635] space-y-1">
              <div className="font-bold text-white text-sm">{callModalJob.customerName}</div>
              <div className="font-mono text-xs text-[#14B8A6]">{callModalJob.phone}</div>
              <div className="text-[11px] text-slate-400 truncate">{callModalJob.location}</div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setCallModalJob(null)}
                className="py-2.5 rounded-xl border border-[#1E2C3D] text-slate-300 font-semibold text-xs hover:bg-[#141F2D]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmDial(callModalJob.phone)}
                className="py-2.5 rounded-xl bg-[#14B8A6] text-[#080D14] font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-teal-500/20"
              >
                <Phone className="w-3.5 h-3.5 fill-[#080D14]" />
                Call Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Part to Work Order Modal */}
      {materialModalOpen && selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddMaterialSubmit}
            className="bg-[#0F1622] rounded-2xl border border-[#1E2C3D] p-5 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">Add Van Stock / Part</h3>
              <button
                type="button"
                onClick={() => setMaterialModalOpen(false)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Part / Material Name</label>
                <input
                  type="text"
                  value={newMaterialName}
                  onChange={e => setNewMaterialName(e.target.value)}
                  placeholder="e.g. 1.5 Inch Brass Gate Valve"
                  className="w-full bg-[#080D14] border border-[#1E2C3D] rounded-xl px-3 py-2 text-white text-xs placeholder-slate-500 focus:border-[#14B8A6] outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={newMaterialQty}
                    onChange={e => setNewMaterialQty(Number(e.target.value))}
                    className="w-full bg-[#080D14] border border-[#1E2C3D] rounded-xl px-3 py-2 text-white text-xs outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Unit Price (KES)</label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={newMaterialPrice}
                    onChange={e => setNewMaterialPrice(Number(e.target.value))}
                    className="w-full bg-[#080D14] border border-[#1E2C3D] rounded-xl px-3 py-2 text-white text-xs outline-hidden"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMaterialModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#1E2C3D] text-slate-300 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-[#14B8A6] text-[#080D14] font-bold text-xs"
              >
                Add to Job
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Customer Signature Modal */}
      {signatureModalOpen && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-md">
            <SignaturePad
              onCancel={() => setSignatureModalOpen(false)}
              onSave={handleSaveSignature}
              signerTitle={`Customer Acceptance Sign-Off (${selectedJob.jobNumber})`}
            />
          </div>
        </div>
      )}
    </div>
  );
};
