import React from 'react';
import {
  AlertTriangle, ArrowRight, Bell, BookOpen, CalendarDays, Check, CheckCircle2, Clock3,
  CloudRain, Droplets, Drone, Edit3, FileText, FlaskConical, Handshake,
  Lightbulb, Mail, MapPin, MessageCircle, Phone, PieChart, Rocket,
  Settings, Sprout, Sun, Trash2, Users, UserRound, Video, Wind, Wrench,
  GraduationCap, Search, ClipboardList, TrendingUp, Leaf, Eye, Compass, Layers
} from 'lucide-react';

const icons = {
  alert: AlertTriangle, arrow: ArrowRight, bell: Bell, book: BookOpen, calendar: CalendarDays,
  check: Check, completed: CheckCircle2, clock: Clock3, rain: CloudRain,
  water: Droplets, drone: Drone, edit: Edit3, report: FileText,
  soil: FlaskConical, community: Handshake, idea: Lightbulb, mail: Mail,
  map: MapPin, message: MessageCircle, phone: Phone, chart: PieChart,
  action: Rocket, settings: Settings, sprout: Sprout, sun: Sun,
  trash: Trash2, users: Users, user: UserRound, video: Video, wind: Wind,
  wrench: Wrench, learning: GraduationCap, search: Search,
  tasks: ClipboardList, trend: TrendingUp, leaf: Leaf, eye: Eye, compass: Compass, layers: Layers,
};

export default function UiIcon({ name, size = 18, strokeWidth = 2, ...props }) {
  const Icon = icons[name] || Leaf;
  return <Icon aria-hidden="true" size={size} strokeWidth={strokeWidth} {...props} />;
}
