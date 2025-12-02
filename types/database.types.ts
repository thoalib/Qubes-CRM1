export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    full_name: string | null
                    role: 'admin' | 'employee'
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    full_name?: string | null
                    role?: 'admin' | 'employee'
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    full_name?: string | null
                    role?: 'admin' | 'employee'
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            leads: {
                Row: {
                    id: string
                    type: 'academy' | 'agency'
                    stage: string
                    assigned_to: string | null
                    created_by: string | null
                    contact_details: Json
                    source: string | null
                    next_follow_up_at: string | null
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    type: 'academy' | 'agency'
                    stage: string
                    assigned_to?: string | null
                    created_by?: string | null
                    contact_details?: Json
                    source?: string | null
                    next_follow_up_at?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    type?: 'academy' | 'agency'
                    stage?: string
                    assigned_to?: string | null
                    created_by?: string | null
                    contact_details?: Json
                    source?: string | null
                    next_follow_up_at?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            students: {
                Row: {
                    id: string
                    lead_id: string | null
                    course: string | null
                    batch: string | null
                    fee_total: number
                    fee_paid: number
                    status: 'active' | 'on_hold' | 'completed' | 'withdrawn'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    lead_id?: string | null
                    course?: string | null
                    batch?: string | null
                    fee_total?: number
                    fee_paid?: number
                    status?: 'active' | 'on_hold' | 'completed' | 'withdrawn'
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    lead_id?: string | null
                    course?: string | null
                    batch?: string | null
                    fee_total?: number
                    fee_paid?: number
                    status?: 'active' | 'on_hold' | 'completed' | 'withdrawn'
                    created_at?: string
                    updated_at?: string
                }
            }
            tasks: {
                Row: {
                    id: string
                    related_lead_id: string | null
                    related_student_id: string | null
                    title: string
                    description: string | null
                    status: 'pending' | 'in_progress' | 'completed' | 'blocked'
                    assigned_to: string | null
                    due_date: string | null
                    priority: 'standard' | 'important' | 'critical'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    related_lead_id?: string | null
                    related_student_id?: string | null
                    title: string
                    description?: string | null
                    status?: 'pending' | 'in_progress' | 'completed' | 'blocked'
                    assigned_to?: string | null
                    due_date?: string | null
                    priority?: 'standard' | 'important' | 'critical'
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    related_lead_id?: string | null
                    related_student_id?: string | null
                    title?: string
                    description?: string | null
                    status?: 'pending' | 'in_progress' | 'completed' | 'blocked'
                    assigned_to?: string | null
                    due_date?: string | null
                    priority?: 'standard' | 'important' | 'critical'
                    created_at?: string
                    updated_at?: string
                }
            }
            finance_entries: {
                Row: {
                    id: string
                    type: 'income' | 'expense'
                    amount: number
                    category: string | null
                    linked_lead_id: string | null
                    linked_student_id: string | null
                    date: string
                    created_by: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    type: 'income' | 'expense'
                    amount: number
                    category?: string | null
                    linked_lead_id?: string | null
                    linked_student_id?: string | null
                    date?: string
                    created_by?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    type?: 'income' | 'expense'
                    amount?: number
                    category?: string | null
                    linked_lead_id?: string | null
                    linked_student_id?: string | null
                    date?: string
                    created_by?: string | null
                    created_at?: string
                }
            }
            notifications: {
                Row: {
                    id: string
                    user_id: string | null
                    title: string
                    message: string | null
                    link: string | null
                    is_read: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    title: string
                    message?: string | null
                    link?: string | null
                    is_read?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    title?: string
                    message?: string | null
                    link?: string | null
                    is_read?: boolean
                    created_at?: string
                }
            }
        }
    }
}
