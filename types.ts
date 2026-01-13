
export interface StockItem {
  id: string;
  sap: string;
  material: string;
  quantity: number;
  und: string;
  category: 'EPI' | 'Material de Serviço' | 'Máquinas' | 'Outros';
  lastUpdated: string;
}

export interface Machine {
  id: string;
  code: string;
  name: string;
  status: 'Disponível' | 'Em Uso' | 'Manutenção';
  lastUpdated: string;
}

export interface CalendarEvent {
  id: string;
  date: string; // ISO format YYYY-MM-DD
  title: string;
  description: string;
}

export interface RequestItem {
  id: string;
  requesterName: string;
  itemDescription: string;
  date: string;
  status: 'Pendente' | 'Atendido' | 'Recusado';
}

export interface MovementRecord {
  id: string;
  batchId?: string;
  userId: string;
  type: 'Entrada' | 'Saída';
  material: string;
  sap: string;
  quantity: number;
  date: string;
  recipient?: string;
}

export interface User {
  username: string;
  isAuthenticated: boolean;
  role: 'admin' | 'user';
}

export enum ViewState {
  DASHBOARD = 'dashboard',
  INVENTORY = 'inventory',
  MOV_MATERIAL = 'mov_material',
  MOV_MACHINE = 'mov_machine',
  CALENDAR = 'calendar',
  ADD_ITEMS = 'add_items',
  REQUESTS = 'requests',
  MOVEMENT_LOG = 'movement_log',
  INVOICES = 'invoices',
  RECEIPTS = 'receipts',
  MANAGE_ACCESS = 'manage_access'
}
