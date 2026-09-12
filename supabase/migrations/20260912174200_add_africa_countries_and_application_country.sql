create table if not exists public.africa_countries (
  code text primary key,
  name text not null unique,
  position smallint not null unique check (position > 0 and position <= 54)
);

alter table public.africa_countries enable row level security;

drop policy if exists "Africa countries are public" on public.africa_countries;
create policy "Africa countries are public"
on public.africa_countries
for select
to anon, authenticated
using (true);

alter table public.badge_applications
  add column if not exists applicant_country text;

create index if not exists badge_applications_applicant_country_idx
  on public.badge_applications (applicant_country);

insert into public.africa_countries (code, name, position) values
('DZ','Algérie',1),('AO','Angola',2),('BJ','Bénin',3),('BW','Botswana',4),('BF','Burkina Faso',5),('BI','Burundi',6),('CV','Cap-Vert',7),('CM','Cameroun',8),('CF','République centrafricaine',9),('TD','Tchad',10),('KM','Comores',11),('CG','République du Congo',12),('CD','République démocratique du Congo',13),('CI','Côte d’Ivoire',14),('DJ','Djibouti',15),('EG','Égypte',16),('GQ','Guinée équatoriale',17),('ER','Érythrée',18),('SZ','Eswatini',19),('ET','Éthiopie',20),('GA','Gabon',21),('GM','Gambie',22),('GH','Ghana',23),('GN','Guinée',24),('GW','Guinée-Bissau',25),('KE','Kenya',26),('LS','Lesotho',27),('LR','Libéria',28),('LY','Libye',29),('MG','Madagascar',30),('MW','Malawi',31),('ML','Mali',32),('MR','Mauritanie',33),('MU','Maurice',34),('MA','Maroc',35),('MZ','Mozambique',36),('NA','Namibie',37),('NE','Niger',38),('NG','Nigéria',39),('RW','Rwanda',40),('ST','Sao Tomé-et-Principe',41),('SN','Sénégal',42),('SC','Seychelles',43),('SL','Sierra Leone',44),('SO','Somalie',45),('ZA','Afrique du Sud',46),('SS','Soudan du Sud',47),('SD','Soudan',48),('TZ','Tanzanie',49),('TG','Togo',50),('TN','Tunisie',51),('UG','Ouganda',52),('ZM','Zambie',53),('ZW','Zimbabwe',54)
on conflict (code) do update set name = excluded.name, position = excluded.position;
