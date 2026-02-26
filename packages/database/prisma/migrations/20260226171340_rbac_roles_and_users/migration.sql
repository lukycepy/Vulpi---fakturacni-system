-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CLIENT', 'USER', 'MANAGER', 'ACCOUNTANT', 'SUPERADMIN');

-- CreateEnum
CREATE TYPE "InvoiceRole" AS ENUM ('owner', 'admin', 'accountant', 'editor');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');

-- CreateEnum
CREATE TYPE "InvoiceType" AS ENUM ('regular', 'proforma', 'credit_note', 'receipt');

-- CreateEnum
CREATE TYPE "IntegrationType" AS ENUM ('api', 'email_parsing');

-- CreateEnum
CREATE TYPE "RecurrenceFrequency" AS ENUM ('monthly', 'quarterly', 'yearly');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "password_hash" TEXT,
    "name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "refresh_token" TEXT,
    "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
    "two_factor_secret" TEXT,
    "password_reset_token" TEXT,
    "password_reset_expires" TIMESTAMP(3),
    "role" "Role" NOT NULL DEFAULT 'CLIENT',
    "organization_id" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "authenticators" (
    "id" TEXT NOT NULL,
    "credential_id" TEXT NOT NULL,
    "credential_public_key" TEXT NOT NULL,
    "counter" BIGINT NOT NULL DEFAULT 0,
    "credential_device_type" TEXT NOT NULL,
    "credential_backed_up" BOOLEAN NOT NULL,
    "transports" TEXT,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "authenticators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity_providers" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "identity_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "ico" TEXT NOT NULL,
    "dic" TEXT,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "logo_url" TEXT,
    "vat_payer" BOOLEAN NOT NULL DEFAULT false,
    "is_oss_registered" BOOLEAN NOT NULL DEFAULT false,
    "inbox_email" TEXT,
    "onboarding_step" INTEGER NOT NULL DEFAULT 0,
    "allowed_ips" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "vault_key" TEXT,
    "smtp_host" TEXT,
    "smtp_port" INTEGER,
    "smtp_user" TEXT,
    "smtp_password" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "gln" TEXT,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_lists" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CZK',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "price_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_prices" (
    "id" TEXT NOT NULL,
    "price_list_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "product_prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "edi_logs" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "edi_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discount_codes" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'PERCENTAGE',
    "value" DECIMAL(10,2) NOT NULL,
    "valid_from" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valid_until" TIMESTAMP(3),
    "usage_limit" INTEGER,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "total_discount_given" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_revenue_generated" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discount_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract_templates" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contract_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "deal_id" TEXT,
    "template_id" TEXT,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "content" TEXT NOT NULL,
    "public_token" TEXT,
    "signed_at" TIMESTAMP(3),
    "signature_data" JSONB,
    "pdf_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouses" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_stocks" (
    "id" TEXT NOT NULL,
    "warehouse_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "reserved" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_stocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_transfers" (
    "id" TEXT NOT NULL,
    "from_warehouse_id" TEXT NOT NULL,
    "to_warehouse_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "stock_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_audits" (
    "id" TEXT NOT NULL,
    "warehouse_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "audit_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed_at" TIMESTAMP(3),
    "note" TEXT,

    CONSTRAINT "inventory_audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_audit_items" (
    "id" TEXT NOT NULL,
    "audit_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "expected_qty" INTEGER NOT NULL,
    "actual_qty" INTEGER NOT NULL,
    "difference" INTEGER NOT NULL,

    CONSTRAINT "inventory_audit_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "inventory_number" TEXT,
    "acquisition_date" DATE NOT NULL,
    "acquisition_price" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CZK',
    "depreciation_group" INTEGER NOT NULL,
    "depreciationMethod" TEXT NOT NULL DEFAULT 'STRAIGHT',
    "residual_value" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "is_depreciated" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_depreciations" (
    "id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "is_posted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asset_depreciations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deals" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "client_id" TEXT,
    "stage_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "value" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'CZK',
    "probability" INTEGER NOT NULL DEFAULT 50,
    "expected_close_date" DATE,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "lost_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deal_stages" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "color" TEXT NOT NULL DEFAULT '#3b82f6',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deal_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "travel_orders" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "vehicle" TEXT NOT NULL,
    "departure_time" TIMESTAMP(3) NOT NULL,
    "arrival_time" TIMESTAMP(3) NOT NULL,
    "meal_allowance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "fuel_allowance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "other_expenses" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "approved_by" TEXT,
    "expense_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "travel_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legislative_rates" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'CZ',
    "meal_low" DECIMAL(10,2) NOT NULL,
    "meal_medium" DECIMAL(10,2) NOT NULL,
    "meal_high" DECIMAL(10,2) NOT NULL,
    "car_wear_rate" DECIMAL(10,2) NOT NULL,
    "fuel_avg_price" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "legislative_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cash_desks" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CZK',
    "current_balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cash_desks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cash_transactions" (
    "id" TEXT NOT NULL,
    "cash_desk_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "description" TEXT NOT NULL,
    "transaction_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "invoice_id" TEXT,
    "expense_id" TEXT,
    "closing_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cash_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cash_closings" (
    "id" TEXT NOT NULL,
    "cash_desk_id" TEXT NOT NULL,
    "closing_date" TIMESTAMP(3) NOT NULL,
    "start_balance" DECIMAL(12,2) NOT NULL,
    "end_balance" DECIMAL(12,2) NOT NULL,
    "closed_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cash_closings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "client_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "hourly_rate" DECIMAL(10,2),
    "currency" TEXT NOT NULL DEFAULT 'CZK',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_entries" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "user_id" TEXT,
    "project_id" TEXT,
    "invoice_id" TEXT,
    "description" TEXT NOT NULL,
    "start_time" TIMESTAMP(3),
    "end_time" TIMESTAMP(3),
    "duration" INTEGER NOT NULL,
    "is_billable" BOOLEAN NOT NULL DEFAULT true,
    "is_invoiced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "time_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "key_hash" TEXT NOT NULL,
    "key_prefix" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "scopes" TEXT[],
    "last_used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_endpoints" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "events" TEXT[],
    "secret" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_endpoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reminder_settings" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT false,
    "first_reminder_days" INTEGER NOT NULL DEFAULT 3,
    "second_reminder_days" INTEGER NOT NULL DEFAULT 7,
    "third_reminder_days" INTEGER NOT NULL DEFAULT 14,
    "first_reminder_text" TEXT,
    "second_reminder_text" TEXT,
    "third_reminder_text" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reminder_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memberships" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "role" "InvoiceRole" NOT NULL,
    "permissions" JSONB DEFAULT '{}',
    "monthly_salary" DECIMAL(12,2),
    "hourly_rate" DECIMAL(10,2),
    "bank_account" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_rules" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "rate_percent" DECIMAL(5,2) NOT NULL,
    "valid_from" DATE NOT NULL,
    "valid_to" DATE,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tax_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "type" "InvoiceType" NOT NULL DEFAULT 'regular',
    "related_invoice_id" TEXT,
    "invoice_number" TEXT NOT NULL,
    "issue_date" DATE NOT NULL,
    "taxable_supply_date" DATE NOT NULL,
    "due_date" DATE NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CZK',
    "exchange_rate" DECIMAL(10,4) NOT NULL DEFAULT 1.0000,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'draft',
    "total_amount" DECIMAL(12,2) NOT NULL,
    "total_vat" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "public_token" TEXT,
    "has_complaint" BOOLEAN NOT NULL DEFAULT false,
    "discount_code_id" TEXT,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_comments" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_client" BOOLEAN NOT NULL DEFAULT false,
    "is_ai" BOOLEAN NOT NULL DEFAULT false,
    "sentiment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotes" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "quote_number" TEXT NOT NULL,
    "issue_date" DATE NOT NULL,
    "valid_until" DATE NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CZK',
    "exchange_rate" DECIMAL(10,4) NOT NULL DEFAULT 1.0000,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "total_amount" DECIMAL(12,2) NOT NULL,
    "total_vat" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quote_items" (
    "id" TEXT NOT NULL,
    "quote_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(12,2) NOT NULL,
    "total_price" DECIMAL(12,2) NOT NULL,
    "vat_rate" DECIMAL(5,2) NOT NULL,
    "vat_amount" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "quote_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "order_number" TEXT NOT NULL,
    "issue_date" DATE NOT NULL,
    "delivery_date" DATE,
    "currency" TEXT NOT NULL DEFAULT 'CZK',
    "exchange_rate" DECIMAL(10,4) NOT NULL DEFAULT 1.0000,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "carrier" TEXT,
    "tracking_number" TEXT,
    "shipping_label_url" TEXT,
    "total_amount" DECIMAL(12,2) NOT NULL,
    "total_vat" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(12,2) NOT NULL,
    "total_price" DECIMAL(12,2) NOT NULL,
    "vat_rate" DECIMAL(5,2) NOT NULL,
    "vat_amount" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#808080',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mime_type" TEXT,
    "size" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exchange_rates" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "rate" DECIMAL(10,4) NOT NULL,
    "date" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exchange_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reminder_logs" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reminder_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_items" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "product_id" TEXT,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(12,2) NOT NULL,
    "total_price" DECIMAL(12,2) NOT NULL,
    "vat_rate" DECIMAL(5,2) NOT NULL,
    "vat_amount" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_accounts" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "bank_code" TEXT NOT NULL,
    "account_name" TEXT,
    "integration_type" "IntegrationType",
    "api_config" JSONB,
    "email_config" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_transactions" (
    "id" TEXT NOT NULL,
    "bank_account_id" TEXT NOT NULL,
    "invoice_id" TEXT,
    "transaction_id" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "variable_symbol" TEXT,
    "transaction_date" DATE NOT NULL,
    "imported_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bank_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ico" TEXT,
    "dic" TEXT,
    "address" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "data_box_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "internal_note" TEXT,
    "marketing_consent" BOOLEAN NOT NULL DEFAULT false,
    "last_invoiced_at" TIMESTAMP(3),
    "price_list_id" TEXT,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "unit_price" DECIMAL(12,2) NOT NULL,
    "vat_rate" DECIMAL(5,2) NOT NULL,
    "unit" TEXT DEFAULT 'ks',
    "ean" TEXT,
    "catalog_number" TEXT,
    "stock_position" TEXT,
    "min_stock_level" INTEGER NOT NULL DEFAULT 0,
    "current_stock" INTEGER NOT NULL DEFAULT 0,
    "parent_id" TEXT,
    "variant_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recurring_templates" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "frequency" "RecurrenceFrequency" NOT NULL,
    "next_run_date" DATE NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "currency" TEXT NOT NULL DEFAULT 'CZK',
    "due_date_days" INTEGER NOT NULL DEFAULT 14,
    "items" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recurring_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "supplier_name" TEXT NOT NULL,
    "supplier_ico" TEXT,
    "supplier_dic" TEXT,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CZK',
    "vat_rate" DECIMAL(5,2) NOT NULL,
    "vat_amount" DECIMAL(12,2) NOT NULL,
    "total_amount" DECIMAL(12,2) NOT NULL,
    "issue_date" DATE NOT NULL,
    "due_date" DATE,
    "category" TEXT,
    "receipt_url" TEXT,
    "is_paid" BOOLEAN NOT NULL DEFAULT false,
    "reimbursement_user_id" TEXT,
    "approved_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "details" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_logs" (
    "id" TEXT NOT NULL,
    "job_name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "error_message" TEXT,
    "executed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER NOT NULL,

    CONSTRAINT "job_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_InvoiceToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_QuoteToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_OrderToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ClientToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "authenticators_credential_id_key" ON "authenticators"("credential_id");

-- CreateIndex
CREATE UNIQUE INDEX "identity_providers_provider_provider_id_key" ON "identity_providers"("provider", "provider_id");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_ico_key" ON "organizations"("ico");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_inbox_email_key" ON "organizations"("inbox_email");

-- CreateIndex
CREATE UNIQUE INDEX "product_prices_price_list_id_product_id_key" ON "product_prices"("price_list_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "discount_codes_organization_id_code_key" ON "discount_codes"("organization_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "contracts_public_token_key" ON "contracts"("public_token");

-- CreateIndex
CREATE UNIQUE INDEX "product_stocks_warehouse_id_product_id_key" ON "product_stocks"("warehouse_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "legislative_rates_year_country_key" ON "legislative_rates"("year", "country");

-- CreateIndex
CREATE UNIQUE INDEX "reminder_settings_organization_id_key" ON "reminder_settings"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "memberships_user_id_organization_id_key" ON "memberships"("user_id", "organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_public_token_key" ON "invoices"("public_token");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoice_number_organization_id_key" ON "invoices"("invoice_number", "organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "quotes_quote_number_organization_id_key" ON "quotes"("quote_number", "organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_number_organization_id_key" ON "orders"("order_number", "organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "exchange_rates_organization_id_currency_date_key" ON "exchange_rates"("organization_id", "currency", "date");

-- CreateIndex
CREATE UNIQUE INDEX "_InvoiceToTag_AB_unique" ON "_InvoiceToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_InvoiceToTag_B_index" ON "_InvoiceToTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_QuoteToTag_AB_unique" ON "_QuoteToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_QuoteToTag_B_index" ON "_QuoteToTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_OrderToTag_AB_unique" ON "_OrderToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_OrderToTag_B_index" ON "_OrderToTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ClientToTag_AB_unique" ON "_ClientToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_ClientToTag_B_index" ON "_ClientToTag"("B");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "authenticators" ADD CONSTRAINT "authenticators_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identity_providers" ADD CONSTRAINT "identity_providers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_lists" ADD CONSTRAINT "price_lists_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_prices" ADD CONSTRAINT "product_prices_price_list_id_fkey" FOREIGN KEY ("price_list_id") REFERENCES "price_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_prices" ADD CONSTRAINT "product_prices_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "edi_logs" ADD CONSTRAINT "edi_logs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount_codes" ADD CONSTRAINT "discount_codes_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_templates" ADD CONSTRAINT "contract_templates_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "deals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "contract_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_stocks" ADD CONSTRAINT "product_stocks_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_stocks" ADD CONSTRAINT "product_stocks_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transfers" ADD CONSTRAINT "stock_transfers_from_warehouse_id_fkey" FOREIGN KEY ("from_warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transfers" ADD CONSTRAINT "stock_transfers_to_warehouse_id_fkey" FOREIGN KEY ("to_warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transfers" ADD CONSTRAINT "stock_transfers_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_audits" ADD CONSTRAINT "inventory_audits_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_audit_items" ADD CONSTRAINT "inventory_audit_items_audit_id_fkey" FOREIGN KEY ("audit_id") REFERENCES "inventory_audits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_audit_items" ADD CONSTRAINT "inventory_audit_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_depreciations" ADD CONSTRAINT "asset_depreciations_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_stage_id_fkey" FOREIGN KEY ("stage_id") REFERENCES "deal_stages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deal_stages" ADD CONSTRAINT "deal_stages_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travel_orders" ADD CONSTRAINT "travel_orders_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travel_orders" ADD CONSTRAINT "travel_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_desks" ADD CONSTRAINT "cash_desks_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_transactions" ADD CONSTRAINT "cash_transactions_cash_desk_id_fkey" FOREIGN KEY ("cash_desk_id") REFERENCES "cash_desks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_transactions" ADD CONSTRAINT "cash_transactions_closing_id_fkey" FOREIGN KEY ("closing_id") REFERENCES "cash_closings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_closings" ADD CONSTRAINT "cash_closings_cash_desk_id_fkey" FOREIGN KEY ("cash_desk_id") REFERENCES "cash_desks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhook_endpoints" ADD CONSTRAINT "webhook_endpoints_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminder_settings" ADD CONSTRAINT "reminder_settings_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_rules" ADD CONSTRAINT "tax_rules_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_discount_code_id_fkey" FOREIGN KEY ("discount_code_id") REFERENCES "discount_codes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_comments" ADD CONSTRAINT "invoice_comments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_items" ADD CONSTRAINT "quote_items_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "quotes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchange_rates" ADD CONSTRAINT "exchange_rates_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminder_logs" ADD CONSTRAINT "reminder_logs_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_transactions" ADD CONSTRAINT "bank_transactions_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "bank_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_transactions" ADD CONSTRAINT "bank_transactions_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_price_list_id_fkey" FOREIGN KEY ("price_list_id") REFERENCES "price_lists"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_templates" ADD CONSTRAINT "recurring_templates_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_templates" ADD CONSTRAINT "recurring_templates_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_reimbursement_user_id_fkey" FOREIGN KEY ("reimbursement_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InvoiceToTag" ADD CONSTRAINT "_InvoiceToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InvoiceToTag" ADD CONSTRAINT "_InvoiceToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QuoteToTag" ADD CONSTRAINT "_QuoteToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "quotes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QuoteToTag" ADD CONSTRAINT "_QuoteToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrderToTag" ADD CONSTRAINT "_OrderToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrderToTag" ADD CONSTRAINT "_OrderToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClientToTag" ADD CONSTRAINT "_ClientToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClientToTag" ADD CONSTRAINT "_ClientToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
