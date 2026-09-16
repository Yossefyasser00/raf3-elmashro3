const fs = require('fs');
let file = fs.readFileSync('frontend/app/dashboard/admin/page.tsx', 'utf8');

file = file.replace(/useState<"overview".+?>/, 'useState<"overview" | "tutor-apps" | "requests" | "users" | "golden-tutors" | "disputes" | "settings" | "workshops" | "payouts" | "invoices">("overview")');

if (!file.includes('const [invoices, setInvoices]')) {
  file = file.replace(
    'const [workshops, setWorkshops] = useState<WorkshopItem[]>([]);',
    'const [workshops, setWorkshops] = useState<WorkshopItem[]>([]);\n  const [invoices, setInvoices] = useState<any[]>([]);\n  const [totalRevenue, setTotalRevenue] = useState(0);\n  const [totalCommission, setTotalCommission] = useState(0);'
  );
}

if (!file.includes('function printInvoice')) {
  file = file.replace(
    'const INITIAL_USERS: UserItem[] = [];',
    'const INITIAL_USERS: UserItem[] = [];\n\nfunction printInvoice(inv: any) {\n  const w = window.open("", "_blank", "width=700,height=600");\n  if (!w) return;\n  w.document.write(<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><title>?????? \</title><style>body { font-family: sans-serif; padding: 40px; direction: rtl; } table { width: 100%; border-collapse: collapse; margin-top: 20px;} td { padding: 10px; border-bottom: 1px solid #ddd; }</style></head><body><h2>????? ??? — \</h2><table><tr><td>??? ??????</td><td>\</td></tr><tr><td>??????</td><td>\</td></tr><tr><td>??????</td><td>\</td></tr><tr><td>??????</td><td>\</td></tr><tr><td>?????? ????????</td><td>\ ?.?</td></tr><tr><td>???????</td><td>\</td></tr></table><script>window.onload = () => window.print();</script></body></html>);\n  w.document.close();\n}'
  );
}

file = file.replace(
  /const\s*\[applications,\s*allRequests,\s*allUsers,\s*disputes,\s*commission,\s*payoutRequests,\s*allWorkshops\]\s*=\s*await\s*Promise\.all\(\[/,
  'const [applications, allRequests, allUsers, disputes, commission, payoutRequests, allWorkshops, invoicesData] = await Promise.all(['
);

file = file.replace(
  /get\("workshops"\),\s*\]\);/,
  'get("workshops"),\n          get("invoices"),\n        ]);'
);

if (!file.includes('if (invoicesData) {')) {
  file = file.replace(
    'setCommissionPct(commission.commissionPercent ?? 15);',
    'if (invoicesData) {\n          setInvoices(invoicesData.invoices ?? []);\n          setTotalRevenue(invoicesData.totalRevenue ?? 0);\n          setTotalCommission(invoicesData.totalCommission ?? 0);\n        }\n\n        setCommissionPct(commission.commissionPercent ?? 15);'
  );
}

fs.writeFileSync('frontend/app/dashboard/admin/page.tsx', file);
console.log('Done');
