# VoltWise — Frontend (SPA)

VoltWise Core / Telemetry / Kafka / Ignite / PostgreSQL / Gemini bileşenlerinden bağımsız,
React + Vite tabanlı tek sayfa uygulama (SPA). VoltWise dokümanındaki 5.1 bölümünde
tanımlanan tüm frontend gereksinimlerini karşılar.

## Kurulum

```bash
npm install
npm run dev
```

Uygulama varsayılan olarak `http://localhost:5173` adresinde açılır.

## Gerçek backend'e bağlama

Şu an uygulama `src/lib/api.js` içindeki bir **mock veri katmanı** ile çalışıyor
(gerçekçi gecikme + canlı telemetri driftini simüle eder), böylece VoltWise Core
ayakta olmadan da uçtan uca test edilebilir.

Core hazır olduğunda kök dizine bir `.env` dosyası ekleyip gerçek API adresini
tanımlamanız yeterli — kod tarafında hiçbir değişiklik gerekmez:

```
VITE_API_BASE=http://localhost:8080/api
```

`api.js` bu değişken tanımlıysa otomatik olarak gerçek REST uçlarına
(`/homes/status`, `/homes/{id}/status`, `/homes/{id}/history`,
`/homes/{id}/appliances` vb.) geçer.

## Ekranlar ve özellikler

- **Giriş / Tanıtım (`/`)** — Sol tarafta yavaşça dönen bir "Volt Orb": içinde
  yarı saydam, dönen bir ev modeli. Fare imleci eve yaklaştıkça ev büyüyüp
  içindeki mobilyalar (koltuk, masa, yatak, TV) belirginleşiyor. Sağda giriş formu.
  Hatalı girişte ekranın üstünden altına kırmızı bir yıldırım çakıyor.
- **Kontrol Paneli (`/dashboard`)** — Kayıtlı konutların kaydırılabilir kart
  ızgarası, 1.8 sn'lik canlı polling, kota aşan konutlar kırmızı vurgu ve
  rozetle ayrışıyor, yükleme sırasında iskelet (skeleton) kartlar gösteriliyor.
- **Konut Detayı (`/home/:id`)** — Ortada 360° döndürülebilen 3D ev modeli.
  Kayıtlı eşyalar ev üzerinde nokta (hotspot) olarak işaretleniyor; sınır
  aşan/anomali bildiren cihazlar kırmızı yanıp sönüyor. Aynı isimli birden
  fazla cihaz (örn. 2 televizyon) hangisine tıklanırsa tıklansın ikisini de
  listeleyen bir detay paneli açıyor. Sağda eşya listesi (ekle/sil), altta
  günlük tüketim grafiği ve AI tarafından üretilip ilgili e-posta adresine
  gönderilmiş tasarruf önerileri listeleniyor. **Yeni eklenen eşyalar** listede
  görünür ama kasıtlı olarak 3D ev modeline dahil edilmez (talep edilen davranış).

## Teknik yığın

React 19 · Vite · React Router · Zustand · @react-three/fiber + drei (3D) ·
Framer Motion (animasyon) · Recharts (grafik)

## Klasör yapısı

```
src/
  lib/          api.js (servis katmanı), mockData.js
  store/        useAppStore.js (auth, toast)
  components/
    landing/    VoltOrb, LoginPanel, LightningStrike
    dashboard/  Dashboard, HomeCard
    home-detail/House3D, ApplianceList, ApplianceInfoDrawer,
                AddApplianceModal, ConsumptionChart, AIAdvisoryPanel
    shared/     ToastStack, Skeleton
```
