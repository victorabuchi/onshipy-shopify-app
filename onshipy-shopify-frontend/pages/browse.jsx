import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const P = {
  bg: '#f1f1f1', surface: '#fff', border: 'rgba(227,227,227,1)',
  text: 'rgba(48,48,48,1)', textSubdued: 'rgba(97,97,97,1)',
  green: '#008060', font: '"Inter var","Inter",-apple-system,BlinkMacSystemFont,sans-serif',
  fontSize: '0.8125rem', fontWeight: '450', letterSpacing: '-0.00833em',
};

const ACTIVITY_POOL = [
  { user: 'Cole M.',   flag: 'US', action: 'imported', item: 'Nike Air Max 270' },
  { user: 'Jessie K.', flag: 'GB', action: 'profit',   profit: '+$350' },
  { user: 'Amara T.',  flag: 'NG', action: 'imported', item: 'Adidas Ultraboost' },
  { user: 'Riku S.',   flag: 'FI', action: 'sold',     item: 'Zara Blazer',       profit: '+$94'  },
  { user: 'Sofia R.',  flag: 'ES', action: 'profit',   profit: '+$212' },
  { user: 'Liam O.',   flag: 'CA', action: 'imported', item: 'Apple AirPods Pro' },
  { user: 'Yuki N.',   flag: 'JP', action: 'sold',     item: 'ASOS Floral Dress', profit: '+$67'  },
  { user: 'Diego M.',  flag: 'BR', action: 'profit',   profit: '+$489' },
  { user: 'Priya L.',  flag: 'IN', action: 'imported', item: 'Gucci GG Belt' },
  { user: 'Noah B.',   flag: 'ZA', action: 'sold',     item: 'Jordan 1 High',     profit: '+$130' },
  { user: 'Lea V.',    flag: 'DE', action: 'profit',   profit: '+$78'  },
  { user: 'Marcus J.', flag: 'US', action: 'imported', item: 'Balenciaga Triple S' },
  { user: 'Chloe F.',  flag: 'FR', action: 'sold',     item: 'Dior Saddle Bag',   profit: '+$320' },
  { user: 'Tariq A.',  flag: 'AE', action: 'profit',   profit: '+$156' },
  { user: 'Mei W.',    flag: 'CN', action: 'imported', item: 'Dyson Airwrap' },
  { user: 'Oscar L.',  flag: 'SE', action: 'sold',     item: 'New Balance 550',   profit: '+$88'  },
  { user: 'Nia G.',    flag: 'GH', action: 'imported', item: 'H&M Linen Set' },
  { user: 'Ben C.',    flag: 'AU', action: 'profit',   profit: '+$203' },
];

const shuffle = arr => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const SVG = {
  fashion:     'M2.5 9.38a1.5 1.5 0 0 1 .44-1.06L9.38 1.88A1.5 1.5 0 0 1 10.44 1.5H16.5a2 2 0 0 1 2 2v6.06a1.5 1.5 0 0 1-.44 1.06l-6.44 6.44a1.5 1.5 0 0 1-2.12 0l-6.56-6.56A1.5 1.5 0 0 1 2.5 9.38ZM13.5 7a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z',
  electronics: 'M7 2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H7ZM10 16a1 1 0 1 1 0-2 1 1 0 0 1 0 2ZM7.5 4.5h5v9h-5v-9Z',
  beauty:      'M10 17c-.28 0-.53-.11-.71-.29L3.64 11.1A4.5 4.5 0 0 1 10 4.6a4.5 4.5 0 0 1 6.36 6.5l-5.65 5.61A1 1 0 0 1 10 17Z',
  sports:      'M6 2v7a4 4 0 0 0 8 0V2H6Zm2 11h4v2H8v-2ZM4 3H2v3a3 3 0 0 0 2.83 3A5.48 5.48 0 0 1 4 7V3Zm14 0h-2v4c0 .73-.17 1.42-.45 2.03A3 3 0 0 0 18 6V3Z',
  sneakers:    'M3.5 13.5A1.5 1.5 0 0 0 5 15h10a1.5 1.5 0 0 0 1.5-1.5v-.75L14 8l-2.5 1.5L9 7.5 6.5 9 4 8.5l-.5 5Z',
  home:        'M10 2L2 9h2v9h4v-4h4v4h4V9h2L10 2Z',
  watches:     'M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2Zm.75 4v4.44l2.53 2.53-1.06 1.06L9.25 11V6h1.5Z',
  bags:        'M6.5 3A1.5 1.5 0 0 0 5 4.5V6H3.5A1.5 1.5 0 0 0 2 7.5v9A1.5 1.5 0 0 0 3.5 18h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 16.5 6H15V4.5A1.5 1.5 0 0 0 13.5 3h-7ZM13.5 6h-7V4.5h7V6Z',
  amazon:      'M10.4 2.143a1 1 0 0 0-.8 0l-7 3.11A1 1 0 0 0 2 6.167V13.833a1 1 0 0 0 .6.924l7 3.11a1 1 0 0 0 .8 0l7-3.11A1 1 0 0 0 18 13.833V6.167a1 1 0 0 0-.6-.924l-7-3.11Z',
  kids:        'M10 2l2.09 4.26L17 7.27l-3.5 3.41.82 4.82L10 13.27l-4.32 2.23.82-4.82L3 7.27l4.91-.71L10 2Z',
  gaming:      'M6 7.5A4.5 4.5 0 0 0 1.5 12v1A3.5 3.5 0 0 0 5 16.5h10a3.5 3.5 0 0 0 3.5-3.5v-1A4.5 4.5 0 0 0 14 7.5H6ZM7 11H5.5v1.5h-1V11H3v-1h1.5V8.5h1V10H7v1Zm5.5 1.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm2-2.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z',
  food:        'M7.5 2a.75.75 0 0 1 .75.75v3a2.25 2.25 0 0 0 1.5 2.12V17.5a.75.75 0 0 1-1.5 0V7.87A2.25 2.25 0 0 0 6.75 5.75v-3A.75.75 0 0 1 7.5 2Zm2.5 0a.75.75 0 0 1 .75.75v3a2.25 2.25 0 0 0 1.5 2.12V17.5a.75.75 0 0 1-1.5 0V7.87A2.25 2.25 0 0 0 9.25 5.75v-3A.75.75 0 0 1 10 2Zm2.5 0a.75.75 0 0 1 .75.75v3a2.25 2.25 0 0 0 1.5 2.12V17.5a.75.75 0 0 1-1.5 0V7.87A2.25 2.25 0 0 0 11.75 5.75v-3A.75.75 0 0 1 12.5 2Z',
  fire:        'M10 2c0 4-4 6-4 10a4 4 0 0 0 8 0c0-2.5-1-4-1-4s-1 2-2 2-2-1-2-2c0-2 3-4 1-6ZM8.5 15.5a1.5 1.5 0 0 1-1.5-1.5c0-2 1.5-3 1.5-3s1.5 1 1.5 3a1.5 1.5 0 0 1-1.5 1.5Z',
};

const Icon = ({ d, size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill={color}><path d={d} /></svg>
);

const NICHES = {
  fashion: {
    label: 'Fashion', icon: 'fashion', color: '#1a1a2e',
    brands: [
      { name: 'Nike', url: 'https://www.nike.com', color: '#111', hot: true },
      { name: 'Adidas', url: 'https://www.adidas.com', color: '#000', hot: true },
      { name: 'Zara', url: 'https://www.zara.com', color: '#1a1a1a', hot: false },
      { name: 'ASOS', url: 'https://www.asos.com', color: '#2d2d2d', hot: true },
      { name: 'H&M', url: 'https://www.hm.com', color: '#e50010', hot: false },
      { name: 'Gucci', url: 'https://www.gucci.com', color: '#2c2c2c', hot: true },
      { name: 'Balenciaga', url: 'https://www.balenciaga.com', color: '#000', hot: true },
      { name: 'Dior', url: 'https://www.dior.com', color: '#1a1a1a', hot: false },
      { name: 'Off-White', url: 'https://www.off---white.com', color: '#000', hot: true },
      { name: 'Uniqlo', url: 'https://www.uniqlo.com', color: '#e40012', hot: true },
      { name: 'Carhartt WIP', url: 'https://www.carhartt-wip.com', color: '#3b3024', hot: true },
      { name: 'Supreme', url: 'https://www.supremenewyork.com', color: '#e42b20', hot: true },
      { name: 'Stone Island', url: 'https://www.stoneisland.com', color: '#333', hot: false },
      { name: 'Palace', url: 'https://shop.palaceskateboards.com', color: '#000', hot: true },
      { name: 'Stussy', url: 'https://www.stussy.com', color: '#000', hot: true },
      { name: 'Kith', url: 'https://kith.com', color: '#1a1a1a', hot: true },
      { name: 'Fear of God', url: 'https://fearofgod.com', color: '#333', hot: true },
      { name: 'Saint Laurent', url: 'https://www.ysl.com', color: '#000', hot: true },
      { name: 'Moncler', url: 'https://www.moncler.com', color: '#1a1a1a', hot: true },
      { name: 'Ami Paris', url: 'https://www.amiparis.com', color: '#e8001c', hot: true },
      { name: 'Ralph Lauren', url: 'https://www.ralphlauren.com', color: '#00205b', hot: false },
      { name: 'Calvin Klein', url: 'https://www.calvinklein.com', color: '#1a1a1a', hot: false },
      { name: 'Burberry', url: 'https://www.burberry.com', color: '#3b1f0f', hot: false },
      { name: 'Versace', url: 'https://www.versace.com', color: '#c4a24a', hot: false },
      { name: 'BAPE', url: 'https://us.bape.com', color: '#4b5320', hot: true },
      { name: 'Acne Studios', url: 'https://www.acnestudios.com', color: '#333', hot: false },
      { name: 'Lacoste', url: 'https://www.lacoste.com', color: '#00843d', hot: false },
      { name: 'Tommy Hilfiger', url: 'https://www.tommy.com', color: '#c8102e', hot: false },
      { name: 'Hugo Boss', url: 'https://www.hugoboss.com', color: '#1a1a1a', hot: false },
      { name: 'Prada', url: 'https://www.prada.com', color: '#1a1a1a', hot: true },
    ],
  },
  streetwear: {
    label: 'Streetwear', icon: 'fashion', color: '#111827',
    brands: [
      { name: 'Supreme', url: 'https://www.supremenewyork.com', color: '#e42b20', hot: true },
      { name: 'Stussy', url: 'https://www.stussy.com', color: '#000', hot: true },
      { name: 'Kith', url: 'https://kith.com', color: '#1a1a1a', hot: true },
      { name: 'Palace', url: 'https://shop.palaceskateboards.com', color: '#000', hot: true },
      { name: 'Fear of God', url: 'https://fearofgod.com', color: '#333', hot: true },
      { name: 'BAPE', url: 'https://us.bape.com', color: '#4b5320', hot: true },
      { name: 'Carhartt WIP', url: 'https://www.carhartt-wip.com', color: '#3b3024', hot: true },
      { name: 'Off-White', url: 'https://www.off---white.com', color: '#000', hot: true },
      { name: 'Anti Social Social Club', url: 'https://www.antisocialsocialclub.com', color: '#ff69b4', hot: true },
      { name: 'Noah NYC', url: 'https://noahny.com', color: '#1a1a1a', hot: false },
      { name: 'Brain Dead', url: 'https://brain-dead.com', color: '#1a1a1a', hot: false },
      { name: 'Aimé Leon Dore', url: 'https://www.aimeлеондоре.com', color: '#1a1a1a', hot: true },
      { name: 'Madhappy', url: 'https://madhappy.com', color: '#1a1a1a', hot: true },
      { name: 'Rhude', url: 'https://rhude.com', color: '#1a1a1a', hot: true },
      { name: 'Cactus Plant Flea Market', url: 'https://cpfm.xyz', color: '#ff6600', hot: true },
      { name: 'Billionaire Boys Club', url: 'https://www.bbcicecream.com', color: '#003da5', hot: false },
      { name: 'Pleasures', url: 'https://pleasures.us', color: '#1a1a1a', hot: false },
      { name: 'Wacko Maria', url: 'https://wackomaria.co.jp', color: '#1a1a1a', hot: false },
      { name: 'Neighborhood', url: 'https://www.neighborhood.jp', color: '#1a1a1a', hot: false },
      { name: 'Undercover', url: 'https://www.undercoverism.com', color: '#1a1a1a', hot: false },
    ],
  },
  electronics: {
    label: 'Electronics', icon: 'electronics', color: '#1428A0',
    brands: [
      { name: 'Apple', url: 'https://www.apple.com', color: '#1d1d1f', hot: true },
      { name: 'Samsung', url: 'https://www.samsung.com', color: '#1428A0', hot: true },
      { name: 'Sony', url: 'https://www.sony.com', color: '#000', hot: false },
      { name: 'Dyson', url: 'https://www.dyson.com', color: '#C41230', hot: true },
      { name: 'DJI', url: 'https://www.dji.com', color: '#1c1c1c', hot: true },
      { name: 'GoPro', url: 'https://gopro.com', color: '#0f3d6b', hot: true },
      { name: 'Razer', url: 'https://www.razer.com', color: '#00d900', hot: true },
      { name: 'Anker', url: 'https://www.anker.com', color: '#00a0e9', hot: true },
      { name: 'Garmin', url: 'https://www.garmin.com', color: '#007cc3', hot: true },
      { name: 'Nothing', url: 'https://nothing.tech', color: '#1a1a1a', hot: true },
      { name: 'Bose', url: 'https://www.bose.com', color: '#000', hot: true },
      { name: 'JBL', url: 'https://www.jbl.com', color: '#e4002b', hot: true },
      { name: 'Marshall', url: 'https://www.marshallheadphones.com', color: '#1a1a1a', hot: false },
      { name: 'Sennheiser', url: 'https://www.sennheiser.com', color: '#000', hot: false },
      { name: 'Beats', url: 'https://www.beatsbydre.com', color: '#e3001b', hot: true },
      { name: 'Logitech', url: 'https://www.logitech.com', color: '#00b3f0', hot: false },
      { name: 'Canon', url: 'https://www.canon.com', color: '#bc0000', hot: false },
      { name: 'Fujifilm', url: 'https://www.fujifilm.com', color: '#e31837', hot: true },
      { name: 'Bang & Olufsen', url: 'https://www.bang-olufsen.com', color: '#222', hot: false },
      { name: 'Sonos', url: 'https://www.sonos.com', color: '#111', hot: true },
      { name: 'Ring', url: 'https://ring.com', color: '#0ea5e9', hot: true },
      { name: 'Elgato', url: 'https://www.elgato.com', color: '#1a1a1a', hot: true },
      { name: 'Xiaomi', url: 'https://www.mi.com', color: '#ff6900', hot: true },
      { name: 'Philips', url: 'https://www.philips.com', color: '#0066a1', hot: false },
      { name: 'LG', url: 'https://www.lg.com', color: '#a50034', hot: false },
      { name: 'Jabra', url: 'https://www.jabra.com', color: '#003087', hot: false },
      { name: 'Nikon', url: 'https://www.nikon.com', color: '#ffd700', hot: false },
      { name: 'Eufy', url: 'https://us.eufy.com', color: '#2563eb', hot: true },
      { name: 'OnePlus', url: 'https://www.oneplus.com', color: '#f5010c', hot: false },
      { name: 'Huawei', url: 'https://www.huawei.com', color: '#cf0a2c', hot: false },
    ],
  },
  beauty: {
    label: 'Beauty', icon: 'beauty', color: '#c8385a',
    brands: [
      { name: 'Charlotte Tilbury', url: 'https://www.charlottetilbury.com', color: '#c8a882', hot: true },
      { name: 'Glossier', url: 'https://www.glossier.com', color: '#e8c5c1', hot: true },
      { name: 'Fenty Beauty', url: 'https://fentybeauty.com', color: '#c8385a', hot: true },
      { name: 'Rare Beauty', url: 'https://www.rarebeauty.com', color: '#d4a5b0', hot: true },
      { name: 'Drunk Elephant', url: 'https://www.drunkelephant.com', color: '#f28c28', hot: true },
      { name: 'The Ordinary', url: 'https://theordinary.com', color: '#1a1a1a', hot: true },
      { name: 'Byredo', url: 'https://www.byredo.com', color: '#1a1a1a', hot: true },
      { name: 'Tom Ford Beauty', url: 'https://www.tomfordbeauty.com', color: '#1a1a1a', hot: true },
      { name: 'NARS', url: 'https://www.narscosmetics.com', color: '#000', hot: false },
      { name: 'Aesop', url: 'https://www.aesop.com', color: '#3c3c3c', hot: false },
      { name: 'Tatcha', url: 'https://www.tatcha.com', color: '#c2945a', hot: true },
      { name: 'MAC', url: 'https://www.maccosmetics.com', color: '#1a1a1a', hot: false },
      { name: "Paula's Choice", url: 'https://www.paulaschoice.com', color: '#2e2e2e', hot: false },
      { name: 'La Mer', url: 'https://www.cremedelamer.com', color: '#2b5a8c', hot: false },
      { name: 'SK-II', url: 'https://www.sk-ii.com', color: '#c8102e', hot: false },
      { name: "Kiehl's", url: 'https://www.kiehls.com', color: '#1a1a1a', hot: false },
      { name: 'Jo Malone', url: 'https://www.jomalone.com', color: '#c8a882', hot: false },
      { name: 'Urban Decay', url: 'https://www.urbandecay.com', color: '#3b1f8c', hot: false },
      { name: 'NYX', url: 'https://www.nyxcosmetics.com', color: '#000', hot: false },
      { name: 'Estée Lauder', url: 'https://www.esteelauder.com', color: '#1a1a1a', hot: false },
      { name: 'Clinique', url: 'https://www.clinique.com', color: '#00a651', hot: false },
      { name: 'Diptyque', url: 'https://www.diptyqueparis.com', color: '#1a1a1a', hot: false },
      { name: 'Olaplex', url: 'https://olaplex.com', color: '#d4af37', hot: true },
      { name: 'Dyson Hair', url: 'https://www.dyson.com/hair-care', color: '#C41230', hot: true },
      { name: 'GHD', url: 'https://www.ghdhair.com', color: '#000', hot: true },
      { name: 'Revlon', url: 'https://www.revlon.com', color: '#c8102e', hot: false },
      { name: 'Maybelline', url: 'https://www.maybelline.com', color: '#000', hot: false },
      { name: "L'Oreal Paris", url: 'https://www.lorealparis.com', color: '#c8102e', hot: false },
      { name: 'Moroccanoil', url: 'https://www.moroccanoil.com', color: '#0f766e', hot: true },
      { name: 'Kerastase', url: 'https://www.kerastase.com', color: '#c8a882', hot: false },
    ],
  },
  skincare: {
    label: 'Skincare', icon: 'beauty', color: '#db2777',
    brands: [
      { name: 'The Ordinary', url: 'https://theordinary.com', color: '#1a1a1a', hot: true },
      { name: 'La Roche-Posay', url: 'https://www.laroche-posay.com', color: '#2563eb', hot: true },
      { name: 'CeraVe', url: 'https://www.cerave.com', color: '#1d4ed8', hot: true },
      { name: "Paula's Choice", url: 'https://www.paulaschoice.com', color: '#2e2e2e', hot: true },
      { name: 'Tatcha', url: 'https://www.tatcha.com', color: '#c2945a', hot: true },
      { name: 'Drunk Elephant', url: 'https://www.drunkelephant.com', color: '#f28c28', hot: true },
      { name: 'Glow Recipe', url: 'https://www.glowrecipe.com', color: '#ff6b6b', hot: true },
      { name: 'Sunday Riley', url: 'https://sundayriley.com', color: '#1a1a1a', hot: true },
      { name: 'Krave Beauty', url: 'https://kravebeauty.com', color: '#f59e0b', hot: false },
      { name: 'COSRX', url: 'https://www.cosrx.com', color: '#1a1a1a', hot: true },
      { name: 'Some By Mi', url: 'https://www.somebymi.com', color: '#ffd700', hot: false },
      { name: 'Innisfree', url: 'https://www.innisfreeworld.com', color: '#22c55e', hot: false },
      { name: "Kiehl's", url: 'https://www.kiehls.com', color: '#1a1a1a', hot: false },
      { name: 'Neutrogena', url: 'https://www.neutrogena.com', color: '#003da5', hot: false },
      { name: 'Cetaphil', url: 'https://www.cetaphil.com', color: '#003da5', hot: false },
      { name: 'First Aid Beauty', url: 'https://www.firstaidbeauty.com', color: '#e31837', hot: false },
      { name: 'Origins', url: 'https://www.origins.com', color: '#1a1a1a', hot: false },
      { name: 'Dermalogica', url: 'https://www.dermalogica.com', color: '#1a1a1a', hot: false },
      { name: 'Skinceuticals', url: 'https://www.skinceuticals.com', color: '#1a1a1a', hot: false },
      { name: 'Belif', url: 'https://www.belif.com', color: '#22c55e', hot: false },
      { name: 'Laneige', url: 'https://www.laneige.com', color: '#003da5', hot: true },
      { name: 'Peach & Lily', url: 'https://www.peachandlily.com', color: '#ff6b6b', hot: false },
      { name: 'Tula', url: 'https://www.tulaprobiotic.com', color: '#f59e0b', hot: false },
      { name: 'Youth to the People', url: 'https://www.youthtothepeople.com', color: '#22c55e', hot: true },
      { name: 'True Botanicals', url: 'https://truebotanicals.com', color: '#22c55e', hot: false },
      { name: 'Herbivore Botanicals', url: 'https://www.herbivorebotanicals.com', color: '#f59e0b', hot: false },
      { name: 'Murad', url: 'https://www.murad.com', color: '#003da5', hot: false },
      { name: 'Caudalie', url: 'https://us.caudalie.com', color: '#7c3aed', hot: false },
      { name: 'Elemis', url: 'https://www.elemis.com', color: '#1a1a1a', hot: false },
      { name: 'REN Skincare', url: 'https://www.renskincare.com', color: '#1a1a1a', hot: false },
    ],
  },
  fragrance: {
    label: 'Fragrance', icon: 'beauty', color: '#be185d',
    brands: [
      { name: 'Byredo', url: 'https://www.byredo.com', color: '#1a1a1a', hot: true },
      { name: 'Le Labo', url: 'https://www.lelabofragrances.com', color: '#1a1a1a', hot: true },
      { name: 'Maison Francis Kurkdjian', url: 'https://www.franciskurkdjian.com', color: '#d4af37', hot: true },
      { name: 'Parfums de Marly', url: 'https://parfums-de-marly.com', color: '#6b7280', hot: true },
      { name: 'Diptyque', url: 'https://www.diptyqueparis.com', color: '#1a1a1a', hot: false },
      { name: 'Jo Malone', url: 'https://www.jomalone.com', color: '#c8a882', hot: false },
      { name: 'Creed', url: 'https://www.creedfragrances.com', color: '#d4af37', hot: true },
      { name: 'Acqua di Parma', url: 'https://www.acquadiparma.com', color: '#f59e0b', hot: false },
      { name: 'Memo Paris', url: 'https://www.memoparis.com', color: '#1a1a1a', hot: false },
      { name: 'Xerjoff', url: 'https://www.xerjoff.com', color: '#d4af37', hot: false },
      { name: 'Amouage', url: 'https://www.amouage.com', color: '#d4af37', hot: false },
      { name: 'Tom Ford', url: 'https://www.tomfordbeauty.com', color: '#1a1a1a', hot: true },
      { name: 'Viktor & Rolf', url: 'https://www.viktor-rolf.com', color: '#1a1a1a', hot: false },
      { name: 'Yves Saint Laurent Beauty', url: 'https://www.yslbeauty.com', color: '#000', hot: false },
      { name: 'Carolina Herrera', url: 'https://www.carolinaherrera.com', color: '#1a1a1a', hot: false },
      { name: 'Versace Fragrance', url: 'https://www.versace.com', color: '#c4a24a', hot: false },
      { name: 'Armani Beauty', url: 'https://www.giorgioarmanibeauty.com', color: '#1a1a1a', hot: false },
      { name: 'Chanel Fragrance', url: 'https://www.chanel.com/fragrance', color: '#000', hot: true },
      { name: 'Dior Fragrance', url: 'https://www.dior.com/fragrance', color: '#1a1a1a', hot: true },
      { name: 'Paco Rabanne', url: 'https://www.pacorabanne.com', color: '#d4af37', hot: false },
      { name: 'Hugo Boss Fragrance', url: 'https://www.hugoboss.com/fragrance', color: '#1a1a1a', hot: false },
      { name: 'Mont Blanc', url: 'https://www.montblanc.com', color: '#1a1a1a', hot: false },
      { name: 'Guerlain', url: 'https://www.guerlain.com', color: '#d4af37', hot: false },
      { name: 'Hermès Fragrance', url: 'https://www.hermes.com/fragrance', color: '#e07000', hot: true },
      { name: 'L\'Artisan Parfumeur', url: 'https://www.lartisanparfumeur.com', color: '#1a1a1a', hot: false },
      { name: 'Penhaligon\'s', url: 'https://www.penhaligons.com', color: '#1a1a1a', hot: false },
      { name: 'Miller Harris', url: 'https://www.millerharris.com', color: '#1a1a1a', hot: false },
      { name: 'Aesop Fragrance', url: 'https://www.aesop.com', color: '#3c3c3c', hot: false },
      { name: 'Commodity', url: 'https://commoditygoods.com', color: '#1a1a1a', hot: false },
      { name: 'Ellis Brooklyn', url: 'https://ellisbrooklyn.com', color: '#1a1a1a', hot: false },
    ],
  },
  sports: {
    label: 'Sports', icon: 'sports', color: '#1a6b3a',
    brands: [
      { name: 'Nike', url: 'https://www.nike.com', color: '#111', hot: true },
      { name: 'Adidas', url: 'https://www.adidas.com', color: '#000', hot: true },
      { name: 'Gymshark', url: 'https://www.gymshark.com', color: '#25262b', hot: true },
      { name: 'Lululemon', url: 'https://www.lululemon.com', color: '#000', hot: true },
      { name: 'Hoka', url: 'https://www.hoka.com', color: '#ff5f1f', hot: true },
      { name: 'On Running', url: 'https://www.on-running.com', color: '#1a1a1a', hot: true },
      { name: 'The North Face', url: 'https://www.thenorthface.com', color: '#e31837', hot: true },
      { name: 'Alo Yoga', url: 'https://www.aloyoga.com', color: '#1a1a1a', hot: true },
      { name: 'Under Armour', url: 'https://www.underarmour.com', color: '#1D1D1D', hot: false },
      { name: 'Puma', url: 'https://www.puma.com', color: '#000', hot: false },
      { name: 'ASICS', url: 'https://www.asics.com', color: '#003da5', hot: false },
      { name: 'Reebok', url: 'https://www.reebok.com', color: '#cc0000', hot: true },
      { name: 'New Balance', url: 'https://www.newbalance.com', color: '#cf0a2c', hot: false },
      { name: 'Salomon', url: 'https://www.salomon.com', color: '#000', hot: false },
      { name: 'Patagonia', url: 'https://www.patagonia.com', color: '#1a5276', hot: false },
      { name: 'Columbia', url: 'https://www.columbia.com', color: '#003da5', hot: false },
      { name: 'Vuori', url: 'https://www.vuoriclothing.com', color: '#3b5998', hot: true },
      { name: "Arc'teryx", url: 'https://arcteryx.com', color: '#111', hot: true },
      { name: 'Brooks', url: 'https://www.brooksrunning.com', color: '#003da5', hot: false },
      { name: 'Mizuno', url: 'https://www.mizunousa.com', color: '#003da5', hot: false },
      { name: 'Wilson', url: 'https://www.wilson.com', color: '#c8102e', hot: false },
      { name: 'Decathlon', url: 'https://www.decathlon.com', color: '#003da5', hot: false },
      { name: 'Callaway', url: 'https://www.callawaygolf.com', color: '#003da5', hot: false },
      { name: 'Oakley', url: 'https://www.oakley.com', color: '#111', hot: true },
      { name: 'Fila', url: 'https://www.fila.com', color: '#003da5', hot: false },
      { name: 'Speedo', url: 'https://www.speedo.com', color: '#003da5', hot: false },
      { name: 'Yonex', url: 'https://www.yonex.com', color: '#e31837', hot: false },
      { name: 'Head', url: 'https://www.head.com', color: '#e31837', hot: false },
      { name: 'Titleist', url: 'https://www.titleist.com', color: '#003da5', hot: false },
      { name: 'TaylorMade', url: 'https://www.taylormadegolf.com', color: '#003da5', hot: false },
    ],
  },
  sneakers: {
    label: 'Sneakers', icon: 'sneakers', color: '#7c3aed',
    brands: [
      { name: 'Nike SNKRS', url: 'https://www.nike.com/launch', color: '#111', hot: true },
      { name: 'Jordan Brand', url: 'https://www.nike.com/jordan', color: '#e41c23', hot: true },
      { name: 'Adidas Originals', url: 'https://www.adidas.com/originals', color: '#000', hot: true },
      { name: 'New Balance', url: 'https://www.newbalance.com', color: '#cf0a2c', hot: true },
      { name: 'ASICS', url: 'https://www.asics.com', color: '#003da5', hot: true },
      { name: 'Saucony', url: 'https://www.saucony.com', color: '#005fb0', hot: true },
      { name: 'Golden Goose', url: 'https://www.goldengoose.com', color: '#1a1a1a', hot: true },
      { name: 'Birkenstock', url: 'https://www.birkenstock.com', color: '#c8a87a', hot: true },
      { name: 'Vans', url: 'https://www.vans.com', color: '#e31837', hot: false },
      { name: 'Converse', url: 'https://www.converse.com', color: '#000', hot: false },
      { name: 'Hoka', url: 'https://www.hoka.com', color: '#ff5f1f', hot: true },
      { name: 'Common Projects', url: 'https://www.commonprojects.com', color: '#1a1a1a', hot: true },
      { name: 'On Running', url: 'https://www.on-running.com', color: '#1a1a1a', hot: true },
      { name: 'Dr. Martens', url: 'https://www.drmartens.com', color: '#facc15', hot: true },
      { name: 'UGG', url: 'https://www.ugg.com', color: '#c8a87a', hot: true },
      { name: 'Crocs', url: 'https://www.crocs.com', color: '#003da5', hot: true },
      { name: 'Salomon', url: 'https://www.salomon.com', color: '#000', hot: true },
      { name: 'Filling Pieces', url: 'https://www.fillingpieces.com', color: '#1a1a1a', hot: false },
      { name: 'Clarks Originals', url: 'https://www.clarksusa.com', color: '#8b6914', hot: false },
      { name: 'Maison Margiela', url: 'https://www.maisonmargiela.com', color: '#1a1a1a', hot: true },
      { name: 'Balenciaga', url: 'https://www.balenciaga.com', color: '#000', hot: true },
      { name: 'Miu Miu', url: 'https://www.miumiu.com', color: '#e8c5c1', hot: true },
      { name: 'Timberland', url: 'https://www.timberland.com', color: '#c8a87a', hot: false },
      { name: 'Reebok', url: 'https://www.reebok.com', color: '#cc0000', hot: false },
      { name: 'Merrell', url: 'https://www.merrell.com', color: '#c8a87a', hot: false },
      { name: 'Brooks', url: 'https://www.brooksrunning.com', color: '#003da5', hot: false },
      { name: 'Mizuno', url: 'https://www.mizunousa.com', color: '#003da5', hot: false },
      { name: 'Puma', url: 'https://www.puma.com', color: '#000', hot: false },
      { name: 'Under Armour', url: 'https://www.underarmour.com', color: '#1D1D1D', hot: false },
      { name: 'Nobull', url: 'https://www.nobullproject.com', color: '#1a1a1a', hot: false },
    ],
  },
  home: {
    label: 'Home & Living', icon: 'home', color: '#0284c7',
    brands: [
      { name: 'IKEA', url: 'https://www.ikea.com', color: '#0058A3', hot: false },
      { name: 'Muji', url: 'https://www.muji.com', color: '#1a1a1a', hot: true },
      { name: 'Hay', url: 'https://www.hay.dk', color: '#000', hot: true },
      { name: 'Anthropologie', url: 'https://www.anthropologie.com', color: '#3d3d3d', hot: true },
      { name: 'Ferm Living', url: 'https://www.fermliving.com', color: '#2b2b2b', hot: true },
      { name: 'RH', url: 'https://rh.com', color: '#1a1a1a', hot: true },
      { name: 'Marimekko', url: 'https://www.marimekko.com', color: '#e31837', hot: true },
      { name: 'Article', url: 'https://www.article.com', color: '#2d2d2d', hot: true },
      { name: 'West Elm', url: 'https://www.westelm.com', color: '#2f2f2f', hot: false },
      { name: 'Crate & Barrel', url: 'https://www.crateandbarrel.com', color: '#333', hot: false },
      { name: 'Zara Home', url: 'https://www.zarahome.com', color: '#1a1a1a', hot: false },
      { name: 'Pottery Barn', url: 'https://www.potterybarn.com', color: '#5c3d1e', hot: false },
      { name: 'Williams-Sonoma', url: 'https://www.williams-sonoma.com', color: '#2e2e2e', hot: false },
      { name: 'Herman Miller', url: 'https://www.hermanmiller.com', color: '#c8102e', hot: true },
      { name: 'Le Creuset', url: 'https://www.lecreuset.com', color: '#dc2626', hot: true },
      { name: 'Our Place', url: 'https://fromourplace.com', color: '#f59e0b', hot: true },
      { name: 'Caraway', url: 'https://www.carawayhome.com', color: '#0f766e', hot: true },
      { name: 'HexClad', url: 'https://hexclad.com', color: '#111827', hot: true },
      { name: 'KitchenAid', url: 'https://www.kitchenaid.com', color: '#dc2626', hot: true },
      { name: 'Ninja', url: 'https://www.ninjakitchen.com', color: '#111', hot: true },
      { name: 'Nespresso', url: 'https://www.nespresso.com', color: '#1a1a1a', hot: true },
      { name: 'Philips Hue', url: 'https://www.philips-hue.com', color: '#facc15', hot: true },
      { name: 'Google Nest', url: 'https://store.google.com', color: '#2563eb', hot: true },
      { name: 'Desenio', url: 'https://desenio.com', color: '#111827', hot: true },
      { name: 'Vitra', url: 'https://www.vitra.com', color: '#1a1a1a', hot: false },
      { name: 'Steelcase', url: 'https://www.steelcase.com', color: '#1d4ed8', hot: false },
      { name: 'Society6', url: 'https://society6.com', color: '#6d28d9', hot: false },
      { name: 'Rifle Paper Co.', url: 'https://riflepaperco.com', color: '#be185d', hot: true },
      { name: 'Bloomingville', url: 'https://www.bloomingville.com', color: '#1a1a1a', hot: false },
      { name: 'Menu', url: 'https://www.menudesignshop.com', color: '#1a1a1a', hot: false },
    ],
  },
  watches: {
    label: 'Watches', icon: 'watches', color: '#92400e',
    brands: [
      { name: 'Rolex', url: 'https://www.rolex.com', color: '#006039', hot: true },
      { name: 'Omega', url: 'https://www.omegawatches.com', color: '#1d1d1b', hot: true },
      { name: 'Seiko', url: 'https://www.seikowatches.com', color: '#1a1a1a', hot: true },
      { name: 'Casio G-Shock', url: 'https://www.casio.com/gshock', color: '#000', hot: true },
      { name: 'Cartier', url: 'https://www.cartier.com', color: '#c8a882', hot: true },
      { name: 'Tudor', url: 'https://www.tudorwatch.com', color: '#1a1a1a', hot: true },
      { name: 'Swatch', url: 'https://www.swatch.com', color: '#c8102e', hot: true },
      { name: 'TAG Heuer', url: 'https://www.tagheuer.com', color: '#c8102e', hot: false },
      { name: 'Tissot', url: 'https://www.tissotwatches.com', color: '#c00', hot: false },
      { name: 'Hamilton', url: 'https://www.hamiltonwatch.com', color: '#1a1a1a', hot: false },
      { name: 'IWC', url: 'https://www.iwc.com', color: '#1a1a1a', hot: false },
      { name: 'Breitling', url: 'https://www.breitling.com', color: '#c8102e', hot: false },
      { name: 'Patek Philippe', url: 'https://www.patek.com', color: '#1a1a1a', hot: true },
      { name: 'Audemars Piguet', url: 'https://www.audemarspiguet.com', color: '#1a1a1a', hot: true },
      { name: 'Richard Mille', url: 'https://www.richardmille.com', color: '#1a1a1a', hot: true },
      { name: 'Hublot', url: 'https://www.hublot.com', color: '#1a1a1a', hot: true },
      { name: 'Apple Watch', url: 'https://www.apple.com/apple-watch', color: '#1d1d1f', hot: true },
      { name: 'Garmin', url: 'https://www.garmin.com', color: '#007cc3', hot: true },
      { name: 'Fossil', url: 'https://www.fossil.com', color: '#8b6914', hot: false },
      { name: 'Citizen', url: 'https://www.citizenwatch.com', color: '#003da5', hot: false },
      { name: 'Longines', url: 'https://www.longines.com', color: '#c8102e', hot: false },
      { name: 'Panerai', url: 'https://www.panerai.com', color: '#1a1a1a', hot: false },
      { name: 'Nomos', url: 'https://nomos-glashuette.com', color: '#1a1a1a', hot: false },
      { name: 'Daniel Wellington', url: 'https://www.danielwellington.com', color: '#1d1d1b', hot: false },
      { name: 'Oura Ring', url: 'https://ouraring.com', color: '#1a1a1a', hot: true },
      { name: 'Withings', url: 'https://www.withings.com', color: '#1a1a1a', hot: false },
      { name: 'Fitbit', url: 'https://www.fitbit.com', color: '#00b0b9', hot: false },
      { name: 'Rado', url: 'https://www.rado.com', color: '#1a1a1a', hot: false },
      { name: 'Frederique Constant', url: 'https://www.frederique-constant.com', color: '#1a1a1a', hot: false },
      { name: 'Samsung Galaxy Watch', url: 'https://www.samsung.com', color: '#1428A0', hot: false },
    ],
  },
  bags: {
    label: 'Bags & Accessories', icon: 'bags', color: '#a16207',
    brands: [
      { name: 'Louis Vuitton', url: 'https://www.louisvuitton.com', color: '#8b6914', hot: true },
      { name: 'Chanel', url: 'https://www.chanel.com', color: '#000', hot: true },
      { name: 'Hermès', url: 'https://www.hermes.com', color: '#e07000', hot: true },
      { name: 'Prada', url: 'https://www.prada.com', color: '#1a1a1a', hot: true },
      { name: 'Celine', url: 'https://www.celine.com', color: '#1a1a1a', hot: true },
      { name: 'Telfar', url: 'https://telfar.net', color: '#000', hot: true },
      { name: 'Bottega Veneta', url: 'https://www.bottegaveneta.com', color: '#5a3e28', hot: true },
      { name: 'Loewe', url: 'https://www.loewe.com', color: '#1a1a1a', hot: true },
      { name: 'Jacquemus', url: 'https://www.jacquemus.com', color: '#1a1a1a', hot: true },
      { name: 'Miu Miu', url: 'https://www.miumiu.com', color: '#e8c5c1', hot: true },
      { name: 'Strathberry', url: 'https://www.strathberry.com', color: '#c8a882', hot: true },
      { name: 'Fendi', url: 'https://www.fendi.com', color: '#8b6914', hot: false },
      { name: 'Coach', url: 'https://www.coach.com', color: '#b5872a', hot: false },
      { name: 'Michael Kors', url: 'https://www.michaelkors.com', color: '#c5a028', hot: false },
      { name: 'Kate Spade', url: 'https://www.katespade.com', color: '#000', hot: false },
      { name: 'Burberry', url: 'https://www.burberry.com', color: '#3b1f0f', hot: false },
      { name: 'MCM', url: 'https://www.mcmworldwide.com', color: '#c8a882', hot: false },
      { name: 'Mulberry', url: 'https://www.mulberry.com', color: '#5a3e28', hot: false },
      { name: 'Away', url: 'https://www.awaytravel.com', color: '#111827', hot: true },
      { name: 'Rimowa', url: 'https://www.rimowa.com', color: '#9ca3af', hot: true },
      { name: 'Tumi', url: 'https://www.tumi.com', color: '#111827', hot: true },
      { name: 'Herschel', url: 'https://herschel.com', color: '#1a1a1a', hot: false },
      { name: 'Fjallraven', url: 'https://www.fjallraven.com', color: '#c8102e', hot: false },
      { name: 'Longchamp', url: 'https://www.longchamp.com', color: '#1a1a1a', hot: false },
      { name: 'Valentino', url: 'https://www.valentino.com', color: '#c8102e', hot: true },
      { name: 'Givenchy', url: 'https://www.givenchy.com', color: '#1a1a1a', hot: false },
      { name: 'Versace', url: 'https://www.versace.com', color: '#c4a24a', hot: false },
      { name: 'Samsonite', url: 'https://www.samsonite.com', color: '#1d4ed8', hot: false },
      { name: 'Balenciaga', url: 'https://www.balenciaga.com', color: '#000', hot: true },
      { name: 'Acne Studios', url: 'https://www.acnestudios.com', color: '#333', hot: false },
    ],
  },
  amazon: {
    label: 'Amazon Finds', icon: 'amazon', color: '#cc8400',
    brands: [
      { name: 'Amazon US', url: 'https://www.amazon.com', color: '#ff9900', hot: true },
      { name: 'Amazon UK', url: 'https://www.amazon.co.uk', color: '#ff9900', hot: true },
      { name: 'Amazon DE', url: 'https://www.amazon.de', color: '#ff9900', hot: false },
      { name: 'Amazon FR', url: 'https://www.amazon.fr', color: '#ff9900', hot: false },
      { name: 'Amazon CA', url: 'https://www.amazon.ca', color: '#ff9900', hot: false },
      { name: 'Amazon AU', url: 'https://www.amazon.com.au', color: '#ff9900', hot: false },
      { name: 'Amazon JP', url: 'https://www.amazon.co.jp', color: '#ff9900', hot: false },
      { name: 'Amazon ES', url: 'https://www.amazon.es', color: '#ff9900', hot: false },
      { name: 'Amazon IT', url: 'https://www.amazon.it', color: '#ff9900', hot: false },
      { name: 'Amazon IN', url: 'https://www.amazon.in', color: '#ff9900', hot: true },
      { name: 'Amazon NL', url: 'https://www.amazon.nl', color: '#ff9900', hot: false },
      { name: 'Amazon PL', url: 'https://www.amazon.pl', color: '#ff9900', hot: false },
      { name: 'Amazon SE', url: 'https://www.amazon.se', color: '#ff9900', hot: false },
      { name: 'Amazon AE', url: 'https://www.amazon.ae', color: '#ff9900', hot: false },
      { name: 'Amazon SG', url: 'https://www.amazon.sg', color: '#ff9900', hot: false },
      { name: 'Amazon BR', url: 'https://www.amazon.com.br', color: '#ff9900', hot: false },
      { name: 'Amazon SA', url: 'https://www.amazon.sa', color: '#ff9900', hot: false },
      { name: 'Amazon MX', url: 'https://www.amazon.com.mx', color: '#ff9900', hot: false },
      { name: 'Amazon TR', url: 'https://www.amazon.com.tr', color: '#ff9900', hot: false },
      { name: 'Amazon Warehouse', url: 'https://www.amazon.com/gp/browse.html?node=10158976011', color: '#e47911', hot: true },
    ],
  },
  kids: {
    label: 'Kids & Toys', icon: 'kids', color: '#d97706',
    brands: [
      { name: 'Lego', url: 'https://www.lego.com', color: '#e3000b', hot: true },
      { name: 'Nike Kids', url: 'https://www.nike.com/kids', color: '#111', hot: true },
      { name: 'Hasbro', url: 'https://www.hasbro.com', color: '#003087', hot: true },
      { name: 'Funko Pop', url: 'https://www.funko.com', color: '#e31e24', hot: true },
      { name: 'Barbie', url: 'https://barbie.mattel.com', color: '#e75480', hot: true },
      { name: 'Hot Wheels', url: 'https://hotwheels.mattel.com', color: '#e31e24', hot: true },
      { name: 'Nerf', url: 'https://www.hasbro.com/nerf', color: '#ff6600', hot: true },
      { name: 'Disney Toys', url: 'https://www.shopdisney.com', color: '#003da5', hot: false },
      { name: 'Pokémon Center', url: 'https://www.pokemoncenter.com', color: '#facc15', hot: true },
      { name: 'Bugaboo', url: 'https://www.bugaboo.com', color: '#111827', hot: true },
      { name: 'Stokke', url: 'https://www.stokke.com', color: '#dc2626', hot: true },
      { name: 'UPPAbaby', url: 'https://uppababy.com', color: '#64748b', hot: true },
      { name: 'Fisher-Price', url: 'https://www.fisher-price.com', color: '#e31e24', hot: false },
      { name: 'Mattel', url: 'https://www.mattel.com', color: '#e31e24', hot: false },
      { name: 'Playmobil', url: 'https://www.playmobil.com', color: '#e31e24', hot: false },
      { name: 'VTech', url: 'https://www.vtech.com', color: '#003da5', hot: false },
      { name: 'Lovevery', url: 'https://lovevery.com', color: '#22c55e', hot: true },
      { name: 'Jellycat', url: 'https://www.jellycat.com', color: '#f59e0b', hot: true },
      { name: 'Nuna', url: 'https://nunababy.com', color: '#1f2937', hot: true },
      { name: 'Ergobaby', url: 'https://ergobaby.com', color: '#1a1a1a', hot: false },
      { name: 'Melissa & Doug', url: 'https://www.melissaanddoug.com', color: '#003da5', hot: false },
      { name: 'Marvel Toys', url: 'https://www.marvel.com/toys', color: '#e31e24', hot: true },
      { name: 'LeapFrog', url: 'https://www.leapfrog.com', color: '#003da5', hot: false },
      { name: 'Infantino', url: 'https://www.infantino.com', color: '#f59e0b', hot: false },
      { name: 'Skip Hop', url: 'https://www.skiphop.com', color: '#f59e0b', hot: false },
      { name: 'Adidas Kids', url: 'https://www.adidas.com/kids', color: '#000', hot: false },
      { name: 'Gap Kids', url: 'https://www.gap.com/kids', color: '#00254b', hot: false },
      { name: 'Graco', url: 'https://www.gracobaby.com', color: '#003da5', hot: false },
      { name: 'Babyzen', url: 'https://www.babyzen.com', color: '#1a1a1a', hot: false },
      { name: 'Chicco', url: 'https://www.chicco.com', color: '#003da5', hot: false },
    ],
  },
  gaming: {
    label: 'Gaming', icon: 'gaming', color: '#6d28d9',
    brands: [
      { name: 'PlayStation', url: 'https://www.playstation.com', color: '#003087', hot: true },
      { name: 'Xbox', url: 'https://www.xbox.com', color: '#107c10', hot: true },
      { name: 'Nintendo', url: 'https://www.nintendo.com', color: '#e4000f', hot: true },
      { name: 'Razer', url: 'https://www.razer.com', color: '#00d900', hot: true },
      { name: 'ASUS ROG', url: 'https://rog.asus.com', color: '#e00', hot: true },
      { name: 'Alienware', url: 'https://www.alienware.com', color: '#1a1a1a', hot: true },
      { name: 'Secretlab', url: 'https://secretlab.co', color: '#1a1a1a', hot: true },
      { name: 'Elgato', url: 'https://www.elgato.com', color: '#1a1a1a', hot: true },
      { name: 'SteelSeries', url: 'https://steelseries.com', color: '#f60', hot: false },
      { name: 'HyperX', url: 'https://www.hyperxgaming.com', color: '#d00', hot: false },
      { name: 'Corsair', url: 'https://www.corsair.com', color: '#ffd700', hot: false },
      { name: 'Logitech G', url: 'https://www.logitechg.com', color: '#00b3f0', hot: false },
      { name: 'MSI Gaming', url: 'https://www.msi.com/gaming', color: '#c8102e', hot: false },
      { name: 'Turtle Beach', url: 'https://www.turtlebeach.com', color: '#003da5', hot: false },
      { name: 'Astro Gaming', url: 'https://www.astrogaming.com', color: '#003da5', hot: false },
      { name: 'Thrustmaster', url: 'https://www.thrustmaster.com', color: '#003da5', hot: false },
      { name: 'Noblechairs', url: 'https://www.noblechairs.com', color: '#1a1a1a', hot: false },
      { name: 'DXRacer', url: 'https://www.dxracer.com', color: '#c8102e', hot: false },
      { name: 'NZXT', url: 'https://www.nzxt.com', color: '#1a1a1a', hot: false },
      { name: 'Nvidia', url: 'https://www.nvidia.com', color: '#76b900', hot: true },
      { name: 'AMD', url: 'https://www.amd.com', color: '#e31837', hot: true },
      { name: 'Seagate', url: 'https://www.seagate.com', color: '#003da5', hot: false },
      { name: 'Western Digital', url: 'https://www.westerndigital.com', color: '#003da5', hot: false },
      { name: 'Samsung SSD', url: 'https://www.samsung.com/semiconductor', color: '#1428A0', hot: true },
      { name: 'Cooler Master', url: 'https://www.coolermaster.com', color: '#003da5', hot: false },
      { name: 'Fanatec', url: 'https://fanatec.com', color: '#003da5', hot: false },
      { name: 'Gigabyte', url: 'https://www.gigabyte.com', color: '#e31837', hot: false },
      { name: 'Crucial', url: 'https://www.crucial.com', color: '#003da5', hot: false },
      { name: 'EVGA', url: 'https://www.evga.com', color: '#003da5', hot: false },
      { name: 'Corsair Vengeance', url: 'https://www.corsair.com/vengeance', color: '#ffd700', hot: false },
    ],
  },
  food: {
    label: 'Food & Wellness', icon: 'food', color: '#166534',
    brands: [
      { name: 'Optimum Nutrition', url: 'https://www.optimumnutrition.com', color: '#003087', hot: true },
      { name: 'MyProtein', url: 'https://www.myprotein.com', color: '#f60', hot: true },
      { name: 'AG1', url: 'https://drinkag1.com', color: '#3b5323', hot: true },
      { name: 'Applied Nutrition', url: 'https://www.appliednutrition.com', color: '#1a1a1a', hot: true },
      { name: 'Quest Nutrition', url: 'https://www.questnutrition.com', color: '#e31e24', hot: true },
      { name: 'Vital Proteins', url: 'https://www.vitalproteins.com', color: '#e8c5c1', hot: true },
      { name: 'Thorne', url: 'https://www.thorne.com', color: '#3b5323', hot: false },
      { name: 'GNC', url: 'https://www.gnc.com', color: '#003087', hot: false },
      { name: 'Holland & Barrett', url: 'https://www.hollandandbarrett.com', color: '#00843d', hot: false },
      { name: 'Herbalife', url: 'https://www.herbalife.com', color: '#e31837', hot: false },
      { name: 'RXBAR', url: 'https://www.rxbar.com', color: '#c8102e', hot: true },
      { name: 'Kind', url: 'https://www.kindsnacks.com', color: '#f59e0b', hot: false },
      { name: 'Clif Bar', url: 'https://www.clifbar.com', color: '#f59e0b', hot: false },
      { name: 'Garden of Life', url: 'https://www.gardenoflife.com', color: '#3b5323', hot: false },
      { name: 'NOW Foods', url: 'https://www.nowfoods.com', color: '#003da5', hot: false },
      { name: 'Nature Made', url: 'https://www.naturemade.com', color: '#003087', hot: false },
      { name: 'Nespresso', url: 'https://www.nespresso.com', color: '#1a1a1a', hot: true },
      { name: 'Ninja Blender', url: 'https://www.ninjakitchen.com', color: '#111', hot: true },
      { name: 'MuscleTech', url: 'https://www.muscletech.com', color: '#003da5', hot: false },
      { name: 'PhD Nutrition', url: 'https://www.phd.com', color: '#003da5', hot: false },
      { name: 'Whittard', url: 'https://www.whittard.co.uk', color: '#1a3a1a', hot: false },
      { name: 'Fortnum & Mason', url: 'https://www.fortnumandmason.com', color: '#6b4226', hot: false },
      { name: 'Perfect Bar', url: 'https://www.perfectbar.com', color: '#22c55e', hot: false },
      { name: 'Bulletproof', url: 'https://www.bulletproof.com', color: '#f59e0b', hot: false },
      { name: 'Soylent', url: 'https://www.soylent.com', color: '#f59e0b', hot: false },
      { name: 'Orgain', url: 'https://www.orgain.com', color: '#22c55e', hot: false },
      { name: 'Larabar', url: 'https://www.larabar.com', color: '#c8102e', hot: false },
      { name: 'BSN', url: 'https://www.bsnusa.com', color: '#003da5', hot: false },
      { name: 'Dymatize', url: 'https://www.dymatize.com', color: '#003da5', hot: false },
      { name: 'Nutrisystem', url: 'https://www.nutrisystem.com', color: '#003da5', hot: false },
    ],
  },
  luxury: {
    label: 'Luxury', icon: 'bags', color: '#4b2e18',
    brands: [
      { name: 'Hermès', url: 'https://www.hermes.com', color: '#e07000', hot: true },
      { name: 'Chanel', url: 'https://www.chanel.com', color: '#000', hot: true },
      { name: 'Louis Vuitton', url: 'https://www.louisvuitton.com', color: '#8b6914', hot: true },
      { name: 'Dior', url: 'https://www.dior.com', color: '#1a1a1a', hot: true },
      { name: 'Cartier', url: 'https://www.cartier.com', color: '#c8a882', hot: true },
      { name: 'Loro Piana', url: 'https://www.loropiana.com', color: '#6a5a4d', hot: true },
      { name: 'Brunello Cucinelli', url: 'https://www.brunellocucinelli.com', color: '#6a5a4d', hot: true },
      { name: 'Zegna', url: 'https://www.zegna.com', color: '#1a1a1a', hot: false },
      { name: 'Kiton', url: 'https://www.kiton.it', color: '#1a1a1a', hot: false },
      { name: 'Brioni', url: 'https://www.brioni.com', color: '#1a1a1a', hot: false },
      { name: 'Berluti', url: 'https://www.berluti.com', color: '#8b6914', hot: false },
      { name: 'Bottega Veneta', url: 'https://www.bottegaveneta.com', color: '#5a3e28', hot: true },
      { name: 'Balenciaga', url: 'https://www.balenciaga.com', color: '#000', hot: true },
      { name: 'Givenchy', url: 'https://www.givenchy.com', color: '#1a1a1a', hot: false },
      { name: 'Celine', url: 'https://www.celine.com', color: '#1a1a1a', hot: true },
      { name: 'Loewe', url: 'https://www.loewe.com', color: '#1a1a1a', hot: true },
      { name: 'Valentino', url: 'https://www.valentino.com', color: '#c8102e', hot: true },
      { name: 'Moncler', url: 'https://www.moncler.com', color: '#1a1a1a', hot: true },
      { name: 'Versace', url: 'https://www.versace.com', color: '#c4a24a', hot: false },
      { name: 'Fendi', url: 'https://www.fendi.com', color: '#8b6914', hot: false },
      { name: 'Burberry', url: 'https://www.burberry.com', color: '#3b1f0f', hot: false },
      { name: 'Prada', url: 'https://www.prada.com', color: '#1a1a1a', hot: true },
      { name: 'Gucci', url: 'https://www.gucci.com', color: '#2c2c2c', hot: true },
      { name: 'Alexander McQueen', url: 'https://www.alexandermcqueen.com', color: '#1a1a1a', hot: false },
      { name: 'Maison Margiela', url: 'https://www.maisonmargiela.com', color: '#1a1a1a', hot: true },
      { name: 'Rick Owens', url: 'https://www.rickowens.eu', color: '#1a1a1a', hot: true },
      { name: 'Jil Sander', url: 'https://www.jilsander.com', color: '#1a1a1a', hot: false },
      { name: 'The Row', url: 'https://www.therow.com', color: '#1a1a1a', hot: true },
      { name: 'Toteme', url: 'https://www.toteme-studio.com', color: '#1a1a1a', hot: true },
      { name: 'Jacquemus', url: 'https://www.jacquemus.com', color: '#1a1a1a', hot: true },
    ],
  },
  jewelry: {
    label: 'Jewelry', icon: 'bags', color: '#a78bfa',
    brands: [
      { name: 'Pandora', url: 'https://www.pandora.net', color: '#d4af37', hot: true },
      { name: 'Swarovski', url: 'https://www.swarovski.com', color: '#c0c0c0', hot: true },
      { name: 'Tiffany & Co.', url: 'https://www.tiffany.com', color: '#81d8d0', hot: true },
      { name: 'Mejuri', url: 'https://mejuri.com', color: '#b08d57', hot: true },
      { name: 'Cartier', url: 'https://www.cartier.com', color: '#c8a882', hot: true },
      { name: 'Van Cleef & Arpels', url: 'https://www.vancleefarpels.com', color: '#d4af37', hot: true },
      { name: 'Bulgari', url: 'https://www.bulgari.com', color: '#d4af37', hot: false },
      { name: 'Chopard', url: 'https://www.chopard.com', color: '#d4af37', hot: false },
      { name: 'Harry Winston', url: 'https://www.harrywinston.com', color: '#1a1a1a', hot: false },
      { name: 'Graff', url: 'https://www.graff.com', color: '#1a1a1a', hot: false },
      { name: 'David Yurman', url: 'https://www.davidyurman.com', color: '#1a1a1a', hot: false },
      { name: 'Mikimoto', url: 'https://www.mikimoto.com', color: '#c0c0c0', hot: false },
      { name: 'Buccellati', url: 'https://www.buccellati.com', color: '#d4af37', hot: false },
      { name: 'Messika', url: 'https://www.messika.com', color: '#d4af37', hot: true },
      { name: 'APM Monaco', url: 'https://www.apm.mc', color: '#c0c0c0', hot: true },
      { name: 'Monica Vinader', url: 'https://www.monicavinader.com', color: '#c8a882', hot: true },
      { name: 'Astley Clarke', url: 'https://www.astleyclarke.com', color: '#1a1a1a', hot: false },
      { name: 'Maria Black', url: 'https://maria-black.com', color: '#1a1a1a', hot: false },
      { name: 'Edge of Ember', url: 'https://www.edgeofember.com', color: '#d4af37', hot: false },
      { name: 'Gorjana', url: 'https://gorjana.com', color: '#d4af37', hot: false },
      { name: 'Jenny Bird', url: 'https://jenny-bird.com', color: '#d4af37', hot: false },
      { name: 'Missoma', url: 'https://www.missoma.com', color: '#d4af37', hot: true },
      { name: 'Anna Sheffield', url: 'https://www.annasheffield.com', color: '#d4af37', hot: false },
      { name: 'Catbird', url: 'https://www.catbirdnyc.com', color: '#d4af37', hot: false },
      { name: 'Kendra Scott', url: 'https://www.kendrascott.com', color: '#d4af37', hot: false },
      { name: 'Alex and Ani', url: 'https://www.alexandani.com', color: '#d4af37', hot: false },
      { name: 'BaubleBar', url: 'https://www.baublebar.com', color: '#d4af37', hot: false },
      { name: 'LAGOS', url: 'https://www.lagos.com', color: '#c0c0c0', hot: false },
      { name: 'John Hardy', url: 'https://www.johnhardy.com', color: '#d4af37', hot: false },
      { name: 'Pomellato', url: 'https://www.pomellato.com', color: '#d4af37', hot: false },
    ],
  },
  eyewear: {
    label: 'Eyewear', icon: 'fashion', color: '#0f766e',
    brands: [
      { name: 'Ray-Ban', url: 'https://www.ray-ban.com', color: '#1a1a1a', hot: true },
      { name: 'Oakley', url: 'https://www.oakley.com', color: '#111', hot: true },
      { name: 'Gentle Monster', url: 'https://www.gentlemonster.com', color: '#1a1a1a', hot: true },
      { name: 'Warby Parker', url: 'https://www.warbyparker.com', color: '#2563eb', hot: true },
      { name: 'Persol', url: 'https://www.persol.com', color: '#d4af37', hot: false },
      { name: 'Oliver Peoples', url: 'https://www.oliverpeoples.com', color: '#1a1a1a', hot: false },
      { name: 'Maui Jim', url: 'https://www.mauijim.com', color: '#003da5', hot: false },
      { name: 'Costa', url: 'https://www.costadelmar.com', color: '#003da5', hot: false },
      { name: 'Dior Eyewear', url: 'https://www.dior.com/eyewear', color: '#1a1a1a', hot: false },
      { name: 'Gucci Eyewear', url: 'https://www.gucci.com/eyewear', color: '#2c2c2c', hot: false },
      { name: 'Prada Eyewear', url: 'https://www.prada.com/eyewear', color: '#1a1a1a', hot: false },
      { name: 'Tom Ford Eyewear', url: 'https://www.tomford.com/eyewear', color: '#1a1a1a', hot: false },
      { name: 'Balenciaga Eyewear', url: 'https://www.balenciaga.com/eyewear', color: '#000', hot: false },
      { name: 'Celine Eyewear', url: 'https://www.celine.com/eyewear', color: '#1a1a1a', hot: false },
      { name: 'Bottega Veneta Eyewear', url: 'https://www.bottegaveneta.com/eyewear', color: '#5a3e28', hot: false },
      { name: 'Mykita', url: 'https://mykita.com', color: '#1a1a1a', hot: false },
      { name: 'Garrett Leight', url: 'https://www.garrettleight.com', color: '#1a1a1a', hot: false },
      { name: 'Anglo American', url: 'https://www.anglo-american.co.uk', color: '#1a1a1a', hot: false },
      { name: 'ic! berlin', url: 'https://www.ic-berlin.de', color: '#1a1a1a', hot: false },
      { name: 'Lindberg', url: 'https://lindberg.com', color: '#1a1a1a', hot: false },
      { name: 'Silhouette', url: 'https://www.silhouette.com', color: '#1a1a1a', hot: false },
      { name: 'Safilo', url: 'https://www.safilo.com', color: '#003da5', hot: false },
      { name: 'Luxottica', url: 'https://www.luxottica.com', color: '#003da5', hot: false },
      { name: 'Marchon', url: 'https://www.marchon.com', color: '#003da5', hot: false },
      { name: 'Modo', url: 'https://modo.com', color: '#1a1a1a', hot: false },
      { name: 'SALT.', url: 'https://saltoptics.com', color: '#1a1a1a', hot: false },
      { name: 'l.a. Eyeworks', url: 'https://laeyeworks.com', color: '#1a1a1a', hot: false },
      { name: 'Face a Face', url: 'https://www.face-a-face-paris.com', color: '#1a1a1a', hot: false },
      { name: 'Anne et Valentin', url: 'https://www.anne-et-valentin.com', color: '#1a1a1a', hot: false },
      { name: 'Cutler and Gross', url: 'https://www.cutlerandgross.com', color: '#1a1a1a', hot: false },
    ],
  },
  outdoor: {
    label: 'Outdoor', icon: 'sports', color: '#14532d',
    brands: [
      { name: 'Patagonia', url: 'https://www.patagonia.com', color: '#1a5276', hot: false },
      { name: 'The North Face', url: 'https://www.thenorthface.com', color: '#e31837', hot: true },
      { name: "Arc'teryx", url: 'https://arcteryx.com', color: '#111', hot: true },
      { name: 'Salomon', url: 'https://www.salomon.com', color: '#000', hot: true },
      { name: 'Columbia', url: 'https://www.columbia.com', color: '#003da5', hot: false },
      { name: 'REI Co-op', url: 'https://www.rei.com', color: '#22c55e', hot: false },
      { name: 'Osprey', url: 'https://www.ospreypacks.com', color: '#1a1a1a', hot: false },
      { name: 'Deuter', url: 'https://www.deuter.com', color: '#c8102e', hot: false },
      { name: 'Gregory', url: 'https://www.gregorypacks.com', color: '#c8102e', hot: false },
      { name: 'Fjallraven', url: 'https://www.fjallraven.com', color: '#c8102e', hot: false },
      { name: 'Mammut', url: 'https://www.mammut.com', color: '#c8102e', hot: false },
      { name: 'Black Diamond', url: 'https://www.blackdiamondequipment.com', color: '#1a1a1a', hot: false },
      { name: 'Petzl', url: 'https://www.petzl.com', color: '#e31837', hot: false },
      { name: 'MSR', url: 'https://www.msrgear.com', color: '#c8102e', hot: false },
      { name: 'Sea to Summit', url: 'https://seatosummit.com', color: '#003da5', hot: false },
      { name: 'Hydro Flask', url: 'https://www.hydroflask.com', color: '#003da5', hot: true },
      { name: 'Stanley', url: 'https://www.stanley1913.com', color: '#22c55e', hot: true },
      { name: 'Yeti', url: 'https://www.yeti.com', color: '#003da5', hot: true },
      { name: 'Patagonia Black Hole', url: 'https://www.patagonia.com', color: '#1a5276', hot: false },
      { name: 'Simms', url: 'https://www.simmsfishing.com', color: '#1a1a1a', hot: false },
      { name: 'Cabela\'s', url: 'https://www.cabelas.com', color: '#22c55e', hot: false },
      { name: 'Bass Pro Shops', url: 'https://www.basspro.com', color: '#22c55e', hot: false },
      { name: 'Benchmade', url: 'https://www.benchmade.com', color: '#003da5', hot: false },
      { name: 'Leatherman', url: 'https://www.leatherman.com', color: '#003da5', hot: false },
      { name: 'Gerber', url: 'https://www.gerbergear.com', color: '#003da5', hot: false },
      { name: 'Garmin Outdoor', url: 'https://www.garmin.com/outdoor', color: '#007cc3', hot: true },
      { name: 'Suunto', url: 'https://www.suunto.com', color: '#c8102e', hot: false },
      { name: 'Camp', url: 'https://www.camp.it', color: '#e31837', hot: false },
      { name: 'Wild Country', url: 'https://www.wildcountry.com', color: '#c8102e', hot: false },
      { name: 'Rab', url: 'https://rab.equipment', color: '#003da5', hot: false },
    ],
  },
  resale: {
    label: 'Resale Platforms', icon: 'amazon', color: '#059669',
    brands: [
      { name: 'StockX', url: 'https://stockx.com', color: '#65a30d', hot: true },
      { name: 'GOAT', url: 'https://www.goat.com', color: '#111827', hot: true },
      { name: 'Grailed', url: 'https://www.grailed.com', color: '#111', hot: true },
      { name: 'Vinted', url: 'https://www.vinted.com', color: '#0f766e', hot: true },
      { name: 'Depop', url: 'https://www.depop.com', color: '#dc2626', hot: true },
      { name: 'Vestiaire Collective', url: 'https://www.vestiairecollective.com', color: '#6b7280', hot: true },
      { name: 'ThredUp', url: 'https://www.thredup.com', color: '#22c55e', hot: false },
      { name: 'Poshmark', url: 'https://poshmark.com', color: '#c8102e', hot: true },
      { name: 'eBay Fashion', url: 'https://www.ebay.com/b/Fashion', color: '#2563eb', hot: false },
      { name: 'The RealReal', url: 'https://www.therealreal.com', color: '#1a1a1a', hot: true },
      { name: 'Tradesy', url: 'https://www.tradesy.com', color: '#1a1a1a', hot: false },
      { name: 'Stadium Goods', url: 'https://www.stadiumgoods.com', color: '#1a1a1a', hot: true },
      { name: 'Flight Club', url: 'https://www.flightclub.com', color: '#1a1a1a', hot: true },
      { name: 'Alias', url: 'https://aliasvault.net', color: '#7c3aed', hot: false },
      { name: 'SneakerCon', url: 'https://www.sneakercon.com', color: '#1a1a1a', hot: false },
      { name: 'HEAT MVMT', url: 'https://heatmvmt.com', color: '#c8102e', hot: true },
      { name: 'Bump Score', url: 'https://bumpscore.com', color: '#1a1a1a', hot: false },
      { name: 'Sneakerlah', url: 'https://sneakerlah.com', color: '#1a1a1a', hot: false },
      { name: 'Sole Supremacy', url: 'https://www.solesupremacy.com', color: '#1a1a1a', hot: false },
      { name: 'KixAndTheCity', url: 'https://kixandthecity.com', color: '#1a1a1a', hot: false },
      { name: 'Alias EU', url: 'https://aliasvault.net', color: '#7c3aed', hot: false },
      { name: 'Catch Of The Day', url: 'https://www.catch.com.au', color: '#22c55e', hot: false },
      { name: 'Rebag', url: 'https://www.rebag.com', color: '#1a1a1a', hot: false },
      { name: 'LePrix', url: 'https://www.leprix.com', color: '#d4af37', hot: false },
      { name: 'Fashionphile', url: 'https://www.fashionphile.com', color: '#d4af37', hot: false },
      { name: 'Worn Well', url: 'https://www.wornwell.com', color: '#1a1a1a', hot: false },
      { name: 'Swap.com', url: 'https://www.swap.com', color: '#22c55e', hot: false },
      { name: 'Curtsy', url: 'https://www.curtsy.com', color: '#e8c5c1', hot: false },
      { name: 'Listia', url: 'https://www.listia.com', color: '#003da5', hot: false },
      { name: 'Offerup', url: 'https://offerup.com', color: '#22c55e', hot: false },
    ],
  },
  marketplace: {
    label: 'Marketplaces', icon: 'amazon', color: '#f59e0b',
    brands: [
      { name: 'Amazon', url: 'https://www.amazon.com', color: '#ff9900', hot: true },
      { name: 'eBay', url: 'https://www.ebay.com', color: '#2563eb', hot: true },
      { name: 'Etsy', url: 'https://www.etsy.com', color: '#f97316', hot: true },
      { name: 'AliExpress', url: 'https://www.aliexpress.com', color: '#dc2626', hot: true },
      { name: 'Temu', url: 'https://www.temu.com', color: '#ea580c', hot: true },
      { name: 'Walmart', url: 'https://www.walmart.com', color: '#1d4ed8', hot: false },
      { name: 'Target', url: 'https://www.target.com', color: '#dc2626', hot: false },
      { name: 'Wish', url: 'https://www.wish.com', color: '#003da5', hot: false },
      { name: 'Shopee', url: 'https://shopee.com', color: '#ea580c', hot: true },
      { name: 'Lazada', url: 'https://www.lazada.com', color: '#003da5', hot: false },
      { name: 'Rakuten', url: 'https://www.rakuten.com', color: '#c8102e', hot: false },
      { name: 'Zalando', url: 'https://www.zalando.com', color: '#f97316', hot: true },
      { name: 'Shein', url: 'https://www.shein.com', color: '#1a1a1a', hot: true },
      { name: 'Farfetch', url: 'https://www.farfetch.com', color: '#1a1a1a', hot: true },
      { name: 'Net-a-Porter', url: 'https://www.net-a-porter.com', color: '#1a1a1a', hot: true },
      { name: 'SSENSE', url: 'https://www.ssense.com', color: '#1a1a1a', hot: true },
      { name: 'Matches Fashion', url: 'https://www.matchesfashion.com', color: '#1a1a1a', hot: false },
      { name: 'My Theresa', url: 'https://www.mytheresa.com', color: '#1a1a1a', hot: false },
      { name: 'Selfridges', url: 'https://www.selfridges.com', color: '#f59e0b', hot: false },
      { name: 'Harrods', url: 'https://www.harrods.com', color: '#006039', hot: false },
      { name: 'Nordstrom', url: 'https://www.nordstrom.com', color: '#1a1a1a', hot: false },
      { name: 'Saks Fifth Avenue', url: 'https://www.saksfifthavenue.com', color: '#1a1a1a', hot: false },
      { name: 'Bergdorf Goodman', url: 'https://www.bergdorfgoodman.com', color: '#1a1a1a', hot: false },
      { name: 'Neiman Marcus', url: 'https://www.neimanmarcus.com', color: '#1a1a1a', hot: false },
      { name: 'John Lewis', url: 'https://www.johnlewis.com', color: '#22c55e', hot: false },
      { name: 'Harvey Nichols', url: 'https://www.harveynichols.com', color: '#1a1a1a', hot: false },
      { name: 'Browns Fashion', url: 'https://www.brownsfashion.com', color: '#1a1a1a', hot: false },
      { name: 'End Clothing', url: 'https://www.endclothing.com', color: '#1a1a1a', hot: true },
      { name: 'Mr Porter', url: 'https://www.mrporter.com', color: '#1a1a1a', hot: true },
      { name: 'LN-CC', url: 'https://www.ln-cc.com', color: '#1a1a1a', hot: false },
    ],
  },
  supplements: {
    label: 'Supplements', icon: 'food', color: '#065f46',
    brands: [
      { name: 'AG1', url: 'https://drinkag1.com', color: '#3b5323', hot: true },
      { name: 'Thorne', url: 'https://www.thorne.com', color: '#3b5323', hot: false },
      { name: 'Vital Proteins', url: 'https://www.vitalproteins.com', color: '#e8c5c1', hot: true },
      { name: 'MyProtein', url: 'https://www.myprotein.com', color: '#f60', hot: true },
      { name: 'Optimum Nutrition', url: 'https://www.optimumnutrition.com', color: '#003087', hot: true },
      { name: 'Garden of Life', url: 'https://www.gardenoflife.com', color: '#3b5323', hot: false },
      { name: 'NOW Foods', url: 'https://www.nowfoods.com', color: '#003da5', hot: false },
      { name: 'Nature Made', url: 'https://www.naturemade.com', color: '#003087', hot: false },
      { name: 'GNC', url: 'https://www.gnc.com', color: '#003087', hot: false },
      { name: 'Holland & Barrett', url: 'https://www.hollandandbarrett.com', color: '#00843d', hot: false },
      { name: 'MuscleTech', url: 'https://www.muscletech.com', color: '#003da5', hot: false },
      { name: 'BSN', url: 'https://www.bsnusa.com', color: '#003da5', hot: false },
      { name: 'Dymatize', url: 'https://www.dymatize.com', color: '#003da5', hot: false },
      { name: 'Cellucor', url: 'https://www.cellucor.com', color: '#dc2626', hot: false },
      { name: 'BPN', url: 'https://www.bareperformancenutrition.com', color: '#1a1a1a', hot: true },
      { name: 'Alpha Lion', url: 'https://www.alphalion.com', color: '#dc2626', hot: true },
      { name: 'Ghost', url: 'https://www.ghostlifestyle.com', color: '#1a1a1a', hot: true },
      { name: 'Gorilla Mind', url: 'https://www.gorillamind.com', color: '#1a1a1a', hot: false },
      { name: 'Transparent Labs', url: 'https://www.transparentlabs.com', color: '#003da5', hot: true },
      { name: 'Legion Athletics', url: 'https://www.legionathletics.com', color: '#003da5', hot: false },
      { name: 'Nutricost', url: 'https://www.nutricost.com', color: '#003da5', hot: false },
      { name: 'Bulk Supplements', url: 'https://www.bulksupplements.com', color: '#003da5', hot: false },
      { name: 'Jarrow Formulas', url: 'https://www.jarrow.com', color: '#003da5', hot: false },
      { name: 'Solgar', url: 'https://www.solgar.com', color: '#d4af37', hot: false },
      { name: 'Pure Encapsulations', url: 'https://www.pureencapsulations.com', color: '#1a1a1a', hot: false },
      { name: 'Nordic Naturals', url: 'https://www.nordicnaturals.com', color: '#003da5', hot: false },
      { name: 'New Chapter', url: 'https://www.newchapter.com', color: '#22c55e', hot: false },
      { name: 'Megafood', url: 'https://www.megafood.com', color: '#22c55e', hot: false },
      { name: 'Ritual', url: 'https://ritual.com', color: '#f59e0b', hot: true },
      { name: 'Care/of', url: 'https://www.takecareof.com', color: '#f59e0b', hot: false },
    ],
  },
  fitness: {
    label: 'Fitness', icon: 'sports', color: '#15803d',
    brands: [
      { name: 'Gymshark', url: 'https://www.gymshark.com', color: '#25262b', hot: true },
      { name: 'Lululemon', url: 'https://www.lululemon.com', color: '#000', hot: true },
      { name: 'Alo Yoga', url: 'https://www.aloyoga.com', color: '#1a1a1a', hot: true },
      { name: 'Vuori', url: 'https://www.vuoriclothing.com', color: '#3b5998', hot: true },
      { name: 'Peloton', url: 'https://www.onepeloton.com', color: '#dc2626', hot: true },
      { name: 'Mirror', url: 'https://www.mirror.co', color: '#1a1a1a', hot: false },
      { name: 'Bowflex', url: 'https://www.bowflex.com', color: '#dc2626', hot: false },
      { name: 'NordicTrack', url: 'https://www.nordictrack.com', color: '#003da5', hot: false },
      { name: 'Life Fitness', url: 'https://www.lifefitness.com', color: '#003da5', hot: false },
      { name: 'TRX', url: 'https://www.trxtraining.com', color: '#dc2626', hot: false },
      { name: 'Rogue Fitness', url: 'https://www.roguefitness.com', color: '#dc2626', hot: true },
      { name: 'Rep Fitness', url: 'https://www.repfitness.com', color: '#003da5', hot: false },
      { name: 'Titan Fitness', url: 'https://www.titanfitness.com', color: '#003da5', hot: false },
      { name: 'Again Faster', url: 'https://www.againfaster.com', color: '#003da5', hot: false },
      { name: 'Aeron', url: 'https://www.hermanmiller.com/products/seating/office-chairs/aeron-chairs/', color: '#c8102e', hot: false },
      { name: 'Dmoose', url: 'https://dmoose.com', color: '#003da5', hot: false },
      { name: 'Harbinger', url: 'https://www.harbingerfitness.com', color: '#003da5', hot: false },
      { name: 'Adidas Training', url: 'https://www.adidas.com/training', color: '#000', hot: false },
      { name: 'Nike Training', url: 'https://www.nike.com/training', color: '#111', hot: true },
      { name: 'Under Armour', url: 'https://www.underarmour.com', color: '#1D1D1D', hot: false },
      { name: 'Outdoor Voices', url: 'https://www.outdoorvoices.com', color: '#1a1a1a', hot: true },
      { name: 'Ten Thousand', url: 'https://www.tenthousand.cc', color: '#1a1a1a', hot: false },
      { name: 'Rhone', url: 'https://www.rhone.com', color: '#1a1a1a', hot: false },
      { name: 'Cuts Clothing', url: 'https://cutsclothing.com', color: '#1a1a1a', hot: false },
      { name: 'Prana', url: 'https://www.prana.com', color: '#1a5276', hot: false },
      { name: 'Manduka', url: 'https://www.manduka.com', color: '#1a1a1a', hot: false },
      { name: 'Gaiam', url: 'https://www.gaiam.com', color: '#22c55e', hot: false },
      { name: 'Jade Yoga', url: 'https://jadeyoga.com', color: '#22c55e', hot: false },
      { name: 'Liforme', url: 'https://liforme.com', color: '#1a1a1a', hot: false },
      { name: 'Sweaty Betty', url: 'https://www.sweatybetty.com', color: '#e8c5c1', hot: true },
    ],
  },
  travel: {
    label: 'Travel', icon: 'bags', color: '#0369a1',
    brands: [
      { name: 'Away', url: 'https://www.awaytravel.com', color: '#111827', hot: true },
      { name: 'Samsonite', url: 'https://www.samsonite.com', color: '#1d4ed8', hot: false },
      { name: 'Rimowa', url: 'https://www.rimowa.com', color: '#9ca3af', hot: true },
      { name: 'Tumi', url: 'https://www.tumi.com', color: '#111827', hot: true },
      { name: 'Bric\'s', url: 'https://www.brics.it', color: '#c8a882', hot: false },
      { name: 'Horizn Studios', url: 'https://www.horiznstudios.com', color: '#1a1a1a', hot: true },
      { name: 'Travelpro', url: 'https://www.travelpro.com', color: '#003da5', hot: false },
      { name: 'American Tourister', url: 'https://www.americantourister.com', color: '#c8102e', hot: false },
      { name: 'Delsey', url: 'https://www.delsey.com', color: '#003da5', hot: false },
      { name: 'Antler', url: 'https://www.antler.co.uk', color: '#1a1a1a', hot: false },
      { name: 'July', url: 'https://www.july.com', color: '#f59e0b', hot: true },
      { name: 'Monos', url: 'https://monos.com', color: '#1a1a1a', hot: true },
      { name: 'Calpak', url: 'https://www.calpak.com', color: '#c8102e', hot: true },
      { name: 'Globe-Trotter', url: 'https://www.globe-trotter.com', color: '#d4af37', hot: false },
      { name: 'Zero Halliburton', url: 'https://www.zerohalliburton.com', color: '#9ca3af', hot: false },
      { name: 'Traveler\'s Choice', url: 'https://www.travelerschoice.com', color: '#003da5', hot: false },
      { name: 'Travelon', url: 'https://www.travelon.com', color: '#003da5', hot: false },
      { name: 'Eagle Creek', url: 'https://www.eaglecreek.com', color: '#003da5', hot: false },
      { name: 'Peak Design', url: 'https://www.peakdesign.com', color: '#1a1a1a', hot: true },
      { name: 'Nomatic', url: 'https://www.nomatic.com', color: '#1a1a1a', hot: true },
      { name: 'Aer', url: 'https://www.aersf.com', color: '#1a1a1a', hot: false },
      { name: 'Bellroy', url: 'https://bellroy.com', color: '#1a1a1a', hot: true },
      { name: 'Tom Bihn', url: 'https://www.tombihn.com', color: '#1a1a1a', hot: false },
      { name: 'Osprey', url: 'https://www.ospreypacks.com', color: '#1a1a1a', hot: false },
      { name: 'Patagonia Black Hole', url: 'https://www.patagonia.com', color: '#1a5276', hot: false },
      { name: 'Porter-Yoshida', url: 'https://www.porter.jp', color: '#1a1a1a', hot: false },
      { name: 'Incase', url: 'https://www.incase.com', color: '#1a1a1a', hot: false },
      { name: 'STM Bags', url: 'https://www.stmbags.com', color: '#1a1a1a', hot: false },
      { name: 'Db Journey', url: 'https://www.dbjourney.com', color: '#003da5', hot: false },
      { name: 'Fjallraven Kanken', url: 'https://www.fjallraven.com', color: '#c8102e', hot: true },
    ],
  },
  pet: {
    label: 'Pet Supplies', icon: 'home', color: '#92400e',
    brands: [
      { name: 'Chewy', url: 'https://www.chewy.com', color: '#2563eb', hot: true },
      { name: 'Furbo', url: 'https://furbo.com', color: '#ea580c', hot: true },
      { name: 'Wild One', url: 'https://wildone.com', color: '#0f766e', hot: true },
      { name: 'Pets at Home', url: 'https://www.petsathome.com', color: '#15803d', hot: false },
      { name: 'Kong', url: 'https://www.kongcompany.com', color: '#dc2626', hot: true },
      { name: 'Ruffwear', url: 'https://www.ruffwear.com', color: '#dc2626', hot: true },
      { name: 'Orvis', url: 'https://www.orvis.com', color: '#22c55e', hot: false },
      { name: 'PetSafe', url: 'https://www.petsafe.net', color: '#003da5', hot: false },
      { name: "Hill's Pet", url: 'https://www.hillspet.com', color: '#003da5', hot: false },
      { name: 'Royal Canin', url: 'https://www.royalcanin.com', color: '#dc2626', hot: false },
      { name: 'Purina', url: 'https://www.purina.com', color: '#003da5', hot: false },
      { name: 'Blue Buffalo', url: 'https://www.bluebuffalo.com', color: '#003da5', hot: false },
      { name: 'Iams', url: 'https://www.iams.com', color: '#dc2626', hot: false },
      { name: 'Science Diet', url: 'https://www.sciencediet.com', color: '#003da5', hot: false },
      { name: 'Merrick', url: 'https://www.merrickpetcare.com', color: '#22c55e', hot: false },
      { name: 'Taste of the Wild', url: 'https://www.tasteofthewildpetfood.com', color: '#92400e', hot: false },
      { name: 'Zignature', url: 'https://zignature.com', color: '#22c55e', hot: false },
      { name: 'Stella & Chewy', url: 'https://www.stellaandchewys.com', color: '#dc2626', hot: false },
      { name: 'Wellness Pet', url: 'https://www.wellnesspetfood.com', color: '#22c55e', hot: false },
      { name: 'Instinct', url: 'https://www.instinctpetfood.com', color: '#003da5', hot: false },
      { name: 'Farmer\'s Dog', url: 'https://www.thefarmersdog.com', color: '#22c55e', hot: true },
      { name: 'Ollie', url: 'https://www.myollie.com', color: '#f59e0b', hot: true },
      { name: 'Nom Nom', url: 'https://www.nomnomnow.com', color: '#f59e0b', hot: false },
      { name: 'Bark Box', url: 'https://www.barkbox.com', color: '#003da5', hot: true },
      { name: 'PetPlate', url: 'https://www.petplate.com', color: '#dc2626', hot: false },
      { name: 'Whistle', url: 'https://www.whistle.com', color: '#003da5', hot: true },
      { name: 'Fi Collar', url: 'https://tryfi.com', color: '#f59e0b', hot: true },
      { name: 'Tractive', url: 'https://tractive.com', color: '#003da5', hot: true },
      { name: 'Petco', url: 'https://www.petco.com', color: '#003da5', hot: false },
      { name: 'PetSmart', url: 'https://www.petsmart.com', color: '#003da5', hot: false },
    ],
  },
  laptops: {
    label: 'Laptops', icon: 'electronics', color: '#0f172a',
    brands: [
      { name: 'MacBook', url: 'https://www.apple.com/mac', color: '#1d1d1f', hot: true },
      { name: 'Dell XPS', url: 'https://www.dell.com/xps', color: '#2563eb', hot: true },
      { name: 'Lenovo ThinkPad', url: 'https://www.lenovo.com/thinkpad', color: '#dc2626', hot: true },
      { name: 'ASUS Zenbook', url: 'https://www.asus.com/zenbook', color: '#1d4ed8', hot: true },
      { name: 'HP Spectre', url: 'https://www.hp.com/spectre', color: '#003da5', hot: false },
      { name: 'Microsoft Surface', url: 'https://www.microsoft.com/surface', color: '#2563eb', hot: true },
      { name: 'Razer Blade', url: 'https://www.razer.com/laptops', color: '#00d900', hot: true },
      { name: 'LG Gram', url: 'https://www.lg.com/gram', color: '#a50034', hot: false },
      { name: 'Samsung Galaxy Book', url: 'https://www.samsung.com/laptops', color: '#1428A0', hot: false },
      { name: 'Acer Swift', url: 'https://www.acer.com/swift', color: '#22c55e', hot: false },
      { name: 'MSI Laptop', url: 'https://www.msi.com/laptop', color: '#c8102e', hot: false },
      { name: 'Gigabyte Aero', url: 'https://www.gigabyte.com/laptop', color: '#e31837', hot: false },
      { name: 'Framework', url: 'https://frame.work', color: '#dc2626', hot: true },
      { name: 'System76', url: 'https://system76.com', color: '#1a1a1a', hot: false },
      { name: 'Clevo', url: 'https://www.clevo.com.tw', color: '#1a1a1a', hot: false },
      { name: 'Toshiba Dynabook', url: 'https://www.dynabook.com', color: '#dc2626', hot: false },
      { name: 'Panasonic Toughbook', url: 'https://www.panasonic.com/toughbook', color: '#003da5', hot: false },
      { name: 'Vaio', url: 'https://vaio.com', color: '#003da5', hot: false },
      { name: 'Huawei MateBook', url: 'https://consumer.huawei.com/laptops', color: '#cf0a2c', hot: false },
      { name: 'Honor MagicBook', url: 'https://www.honor.com', color: '#cf0a2c', hot: false },
      { name: 'Xiaomi Book', url: 'https://www.mi.com/laptops', color: '#ff6900', hot: false },
      { name: 'OnePlus Laptop', url: 'https://www.oneplus.com', color: '#f5010c', hot: false },
      { name: 'Alienware', url: 'https://www.alienware.com/laptops', color: '#1a1a1a', hot: true },
      { name: 'Omen by HP', url: 'https://www.hp.com/omen', color: '#dc2626', hot: false },
      { name: 'Predator by Acer', url: 'https://www.acer.com/predator', color: '#22c55e', hot: false },
      { name: 'ROG by ASUS', url: 'https://rog.asus.com/laptops', color: '#dc2626', hot: true },
      { name: 'Lenovo Legion', url: 'https://www.lenovo.com/legion', color: '#dc2626', hot: true },
      { name: 'Dell Alienware m18', url: 'https://www.dell.com/alienware', color: '#1a1a1a', hot: false },
      { name: 'Gigabyte Gaming', url: 'https://www.gigabyte.com/gaming', color: '#e31837', hot: false },
      { name: 'Schenker', url: 'https://www.schenker-tech.de', color: '#1a1a1a', hot: false },
    ],
  },
  phones: {
    label: 'Phones', icon: 'electronics', color: '#1e40af',
    brands: [
      { name: 'Apple iPhone', url: 'https://www.apple.com/iphone', color: '#1d1d1f', hot: true },
      { name: 'Samsung Galaxy', url: 'https://www.samsung.com/galaxy', color: '#1428A0', hot: true },
      { name: 'Google Pixel', url: 'https://store.google.com/pixel', color: '#2563eb', hot: true },
      { name: 'Nothing', url: 'https://nothing.tech', color: '#1a1a1a', hot: true },
      { name: 'OnePlus', url: 'https://www.oneplus.com', color: '#f5010c', hot: false },
      { name: 'Sony Xperia', url: 'https://www.sony.com/xperia', color: '#000', hot: false },
      { name: 'Motorola', url: 'https://www.motorola.com', color: '#003da5', hot: false },
      { name: 'Nokia', url: 'https://www.nokia.com/phones', color: '#003da5', hot: false },
      { name: 'Xiaomi', url: 'https://www.mi.com', color: '#ff6900', hot: true },
      { name: 'Oppo', url: 'https://www.oppo.com', color: '#1a1a1a', hot: false },
      { name: 'Vivo', url: 'https://www.vivo.com', color: '#003da5', hot: false },
      { name: 'Realme', url: 'https://www.realme.com', color: '#f59e0b', hot: false },
      { name: 'Huawei', url: 'https://www.huawei.com/phones', color: '#cf0a2c', hot: false },
      { name: 'Honor', url: 'https://www.honor.com', color: '#cf0a2c', hot: false },
      { name: 'Asus ROG Phone', url: 'https://rog.asus.com/phones', color: '#dc2626', hot: true },
      { name: 'Nubia', url: 'https://www.nubia.com', color: '#dc2626', hot: false },
      { name: 'ZTE', url: 'https://www.ztedevices.com', color: '#003da5', hot: false },
      { name: 'HTC', url: 'https://www.htc.com', color: '#003da5', hot: false },
      { name: 'Blackberry', url: 'https://www.blackberry.com', color: '#1a1a1a', hot: false },
      { name: 'Cat Phones', url: 'https://www.catphones.com', color: '#f59e0b', hot: false },
      { name: 'Fairphone', url: 'https://www.fairphone.com', color: '#22c55e', hot: true },
      { name: 'Shift', url: 'https://www.shiftphones.com', color: '#22c55e', hot: false },
      { name: 'Punkt', url: 'https://www.punkt.ch', color: '#1a1a1a', hot: false },
      { name: 'Light Phone', url: 'https://www.thelightphone.com', color: '#1a1a1a', hot: false },
      { name: 'Palm', url: 'https://www.palm.com', color: '#f59e0b', hot: false },
      { name: 'Unihertz', url: 'https://www.unihertz.com', color: '#1a1a1a', hot: false },
      { name: 'Ulefone', url: 'https://www.ulefone.com', color: '#f59e0b', hot: false },
      { name: 'Doogee', url: 'https://www.doogee.cc', color: '#003da5', hot: false },
      { name: 'Cubot', url: 'https://www.cubot.net', color: '#f59e0b', hot: false },
      { name: 'Oukitel', url: 'https://www.oukitel.com', color: '#dc2626', hot: false },
    ],
  },
  audio: {
    label: 'Audio', icon: 'electronics', color: '#4c1d95',
    brands: [
      { name: 'Bose', url: 'https://www.bose.com', color: '#000', hot: true },
      { name: 'Sonos', url: 'https://www.sonos.com', color: '#111', hot: true },
      { name: 'JBL', url: 'https://www.jbl.com', color: '#e4002b', hot: true },
      { name: 'Marshall', url: 'https://www.marshallheadphones.com', color: '#1a1a1a', hot: true },
      { name: 'Bang & Olufsen', url: 'https://www.bang-olufsen.com', color: '#222', hot: false },
      { name: 'Sennheiser', url: 'https://www.sennheiser.com', color: '#000', hot: false },
      { name: 'Beats', url: 'https://www.beatsbydre.com', color: '#e3001b', hot: true },
      { name: 'Apple AirPods', url: 'https://www.apple.com/airpods', color: '#1d1d1f', hot: true },
      { name: 'Sony WH', url: 'https://www.sony.com/headphones', color: '#000', hot: true },
      { name: 'Audio-Technica', url: 'https://www.audio-technica.com', color: '#111827', hot: false },
      { name: 'Jabra', url: 'https://www.jabra.com', color: '#003087', hot: false },
      { name: 'Skullcandy', url: 'https://www.skullcandy.com', color: '#dc2626', hot: false },
      { name: 'Plantronics', url: 'https://www.poly.com', color: '#003da5', hot: false },
      { name: 'Shure', url: 'https://www.shure.com', color: '#003da5', hot: false },
      { name: 'AKG', url: 'https://www.akg.com', color: '#003da5', hot: false },
      { name: 'Beyerdynamic', url: 'https://www.beyerdynamic.com', color: '#003da5', hot: false },
      { name: 'Grado', url: 'https://gradolabs.com', color: '#d4af37', hot: false },
      { name: 'Focal', url: 'https://www.focal.com', color: '#dc2626', hot: false },
      { name: 'Denon', url: 'https://www.denon.com', color: '#1a1a1a', hot: false },
      { name: 'Marantz', url: 'https://www.marantz.com', color: '#d4af37', hot: false },
      { name: 'Yamaha Audio', url: 'https://usa.yamaha.com/audio', color: '#003da5', hot: false },
      { name: 'Pioneer DJ', url: 'https://www.pioneerdj.com', color: '#dc2626', hot: false },
      { name: 'Technics', url: 'https://www.technics.com', color: '#1a1a1a', hot: false },
      { name: 'KEF', url: 'https://www.kef.com', color: '#003da5', hot: false },
      { name: 'Klipsch', url: 'https://www.klipsch.com', color: '#dc2626', hot: false },
      { name: 'Polk Audio', url: 'https://www.polkaudio.com', color: '#003da5', hot: false },
      { name: 'Harman Kardon', url: 'https://www.harmankardon.com', color: '#1a1a1a', hot: false },
      { name: 'Edifier', url: 'https://www.edifier.com', color: '#003da5', hot: false },
      { name: 'Anker Soundcore', url: 'https://www.soundcore.com', color: '#00a0e9', hot: true },
      { name: 'EarFun', url: 'https://www.myearfun.com', color: '#f59e0b', hot: false },
    ],
  },
  camera: {
    label: 'Camera Gear', icon: 'electronics', color: '#991b1b',
    brands: [
      { name: 'Canon', url: 'https://www.canon.com', color: '#bc0000', hot: false },
      { name: 'Sony Alpha', url: 'https://electronics.sony.com/cameras', color: '#000', hot: true },
      { name: 'Nikon', url: 'https://www.nikon.com', color: '#ffd700', hot: false },
      { name: 'Fujifilm', url: 'https://www.fujifilm.com', color: '#e31837', hot: true },
      { name: 'DJI', url: 'https://www.dji.com', color: '#1c1c1c', hot: true },
      { name: 'GoPro', url: 'https://gopro.com', color: '#0f3d6b', hot: true },
      { name: 'Panasonic Lumix', url: 'https://www.panasonic.com/cameras', color: '#003da5', hot: false },
      { name: 'Olympus', url: 'https://www.olympus-imaging.com', color: '#003da5', hot: false },
      { name: 'Leica', url: 'https://www.leica-camera.com', color: '#dc2626', hot: true },
      { name: 'Hasselblad', url: 'https://www.hasselblad.com', color: '#1a1a1a', hot: false },
      { name: 'Phase One', url: 'https://www.phaseone.com', color: '#1a1a1a', hot: false },
      { name: 'Sigma', url: 'https://www.sigmaphoto.com', color: '#1a1a1a', hot: false },
      { name: 'Tamron', url: 'https://www.tamron.com', color: '#dc2626', hot: false },
      { name: 'Tokina', url: 'https://tokina.com', color: '#1a1a1a', hot: false },
      { name: 'Zeiss', url: 'https://www.zeiss.com', color: '#1a1a1a', hot: false },
      { name: 'Peak Design', url: 'https://www.peakdesign.com', color: '#1a1a1a', hot: true },
      { name: 'Lowepro', url: 'https://www.lowepro.com', color: '#dc2626', hot: false },
      { name: 'Think Tank', url: 'https://www.thinktankphoto.com', color: '#1a1a1a', hot: false },
      { name: 'Manfrotto', url: 'https://www.manfrotto.com', color: '#dc2626', hot: false },
      { name: 'Gitzo', url: 'https://www.gitzo.com', color: '#1a1a1a', hot: false },
      { name: 'Joby', url: 'https://joby.com', color: '#dc2626', hot: true },
      { name: 'Rode', url: 'https://www.rode.com', color: '#dc2626', hot: true },
      { name: 'Deity', url: 'https://www.deitymic.com', color: '#1a1a1a', hot: false },
      { name: 'Elgato Key Light', url: 'https://www.elgato.com/key-light', color: '#1a1a1a', hot: true },
      { name: 'Aputure', url: 'https://www.aputure.com', color: '#22c55e', hot: true },
      { name: 'Godox', url: 'https://www.godox.com', color: '#f59e0b', hot: true },
      { name: 'Profoto', url: 'https://profoto.com', color: '#1a1a1a', hot: false },
      { name: 'Elinchrom', url: 'https://www.elinchrom.com', color: '#1a1a1a', hot: false },
      { name: 'Polaroid', url: 'https://www.polaroid.com', color: '#003da5', hot: true },
      { name: 'Instax by Fujifilm', url: 'https://instax.com', color: '#e31837', hot: true },
    ],
  },
  smart_home: {
    label: 'Smart Home', icon: 'home', color: '#1d4ed8',
    brands: [
      { name: 'Google Nest', url: 'https://store.google.com/nest', color: '#2563eb', hot: true },
      { name: 'Ring', url: 'https://ring.com', color: '#0ea5e9', hot: true },
      { name: 'Philips Hue', url: 'https://www.philips-hue.com', color: '#facc15', hot: true },
      { name: 'Eufy', url: 'https://us.eufy.com', color: '#2563eb', hot: true },
      { name: 'Amazon Echo', url: 'https://www.amazon.com/echo', color: '#ff9900', hot: true },
      { name: 'Apple HomePod', url: 'https://www.apple.com/homepod', color: '#1d1d1f', hot: true },
      { name: 'Arlo', url: 'https://www.arlo.com', color: '#22c55e', hot: true },
      { name: 'Wyze', url: 'https://www.wyze.com', color: '#003da5', hot: true },
      { name: 'Blink', url: 'https://blinkforhome.com', color: '#003da5', hot: false },
      { name: 'Nest Learning Thermostat', url: 'https://store.google.com/thermostat', color: '#2563eb', hot: true },
      { name: 'Ecobee', url: 'https://www.ecobee.com', color: '#22c55e', hot: false },
      { name: 'Honeywell', url: 'https://www.honeywellhome.com', color: '#dc2626', hot: false },
      { name: 'Lutron', url: 'https://www.lutron.com', color: '#dc2626', hot: false },
      { name: 'LIFX', url: 'https://www.lifx.com', color: '#f59e0b', hot: false },
      { name: 'Nanoleaf', url: 'https://nanoleaf.me', color: '#22c55e', hot: true },
      { name: 'Govee', url: 'https://www.govee.com', color: '#f59e0b', hot: true },
      { name: 'August Smart Lock', url: 'https://august.com', color: '#003da5', hot: true },
      { name: 'Schlage', url: 'https://www.schlage.com', color: '#003da5', hot: false },
      { name: 'Yale', url: 'https://www.yalehome.com', color: '#003da5', hot: false },
      { name: 'Kwikset', url: 'https://www.kwikset.com', color: '#003da5', hot: false },
      { name: 'iRobot', url: 'https://www.irobot.com', color: '#dc2626', hot: true },
      { name: 'Roborock', url: 'https://www.roborock.com', color: '#dc2626', hot: true },
      { name: 'Ecovacs', url: 'https://www.ecovacs.com', color: '#003da5', hot: false },
      { name: 'Shark', url: 'https://www.sharkclean.com', color: '#dc2626', hot: false },
      { name: 'Dyson Robot', url: 'https://www.dyson.com/robot-vacuums', color: '#C41230', hot: true },
      { name: 'SmartThings', url: 'https://www.smartthings.com', color: '#1428A0', hot: false },
      { name: 'Hubitat', url: 'https://hubitat.com', color: '#22c55e', hot: false },
      { name: 'Eve Systems', url: 'https://www.evehome.com', color: '#f59e0b', hot: false },
      { name: 'Wemo', url: 'https://www.wemo.com', color: '#003da5', hot: false },
      { name: 'TP-Link Kasa', url: 'https://www.tp-link.com/kasa', color: '#22c55e', hot: false },
    ],
  },
  menswear: {
    label: 'Menswear', icon: 'fashion', color: '#1f2937',
    brands: [
      { name: 'COS', url: 'https://www.cosstores.com', color: '#1a1a1a', hot: false },
      { name: 'A.P.C.', url: 'https://www.apc.fr', color: '#1a1a1a', hot: false },
      { name: 'Ami Paris', url: 'https://www.amiparis.com', color: '#e8001c', hot: true },
      { name: 'Stone Island', url: 'https://www.stoneisland.com', color: '#333', hot: true },
      { name: 'Carhartt WIP', url: 'https://www.carhartt-wip.com', color: '#3b3024', hot: true },
      { name: 'Acne Studios', url: 'https://www.acnestudios.com', color: '#333', hot: false },
      { name: 'Zegna', url: 'https://www.zegna.com', color: '#1a1a1a', hot: false },
      { name: 'Canali', url: 'https://www.canali.com', color: '#1a1a1a', hot: false },
      { name: 'Boggi Milano', url: 'https://www.boggi.com', color: '#1a1a1a', hot: false },
      { name: 'Suitsupply', url: 'https://www.suitsupply.com', color: '#1a1a1a', hot: true },
      { name: 'Charles Tyrwhitt', url: 'https://www.ctshirts.com', color: '#003da5', hot: false },
      { name: 'Brooks Brothers', url: 'https://www.brooksbrothers.com', color: '#003da5', hot: false },
      { name: 'J.Crew', url: 'https://www.jcrew.com', color: '#003da5', hot: false },
      { name: 'Todd Snyder', url: 'https://www.toddsnyder.com', color: '#1a1a1a', hot: false },
      { name: 'Taylor Stitch', url: 'https://www.taylorstitch.com', color: '#1a1a1a', hot: false },
      { name: 'Outerknown', url: 'https://www.outerknown.com', color: '#1a5276', hot: false },
      { name: 'Faherty', url: 'https://fahertybrand.com', color: '#1a5276', hot: false },
      { name: 'Buck Mason', url: 'https://www.buckmason.com', color: '#1a1a1a', hot: false },
      { name: 'Reigning Champ', url: 'https://www.reigningchamp.com', color: '#1a1a1a', hot: true },
      { name: 'wings+horns', url: 'https://wingsandhorns.com', color: '#1a1a1a', hot: false },
      { name: 'Nanamica', url: 'https://www.nanamica.com', color: '#1a1a1a', hot: false },
      { name: 'Snow Peak', url: 'https://www.snowpeak.com', color: '#1a1a1a', hot: false },
      { name: 'Engineered Garments', url: 'https://www.engineeredgarments.com', color: '#1a1a1a', hot: false },
      { name: 'Monitaly', url: 'https://www.monitaly.com', color: '#1a1a1a', hot: false },
      { name: 'Needles', url: 'https://www.needles.jp', color: '#1a1a1a', hot: false },
      { name: 'Kapital', url: 'https://kapital.jp', color: '#1a1a1a', hot: false },
      { name: 'Visvim', url: 'https://www.visvim.tv', color: '#1a1a1a', hot: true },
      { name: 'Gitman Vintage', url: 'https://gitmanvintage.com', color: '#1a1a1a', hot: false },
      { name: 'Drakes London', url: 'https://www.drakes.com', color: '#1a1a1a', hot: false },
      { name: 'Anglo-Italian', url: 'https://www.anglo-italian.com', color: '#1a1a1a', hot: false },
    ],
  },
  womenswear: {
    label: 'Womenswear', icon: 'fashion', color: '#9d174d',
    brands: [
      { name: 'Zara', url: 'https://www.zara.com', color: '#1a1a1a', hot: false },
      { name: 'Mango', url: 'https://www.mango.com', color: '#222', hot: false },
      { name: 'Aritzia', url: 'https://www.aritzia.com', color: '#111827', hot: true },
      { name: 'Reformation', url: 'https://www.thereformation.com', color: '#166534', hot: true },
      { name: 'Dôen', url: 'https://www.shopdoen.com', color: '#f59e0b', hot: true },
      { name: 'Staud', url: 'https://www.staud.clothing', color: '#1a1a1a', hot: true },
      { name: 'Ganni', url: 'https://www.ganni.com', color: '#f59e0b', hot: true },
      { name: 'Rouje', url: 'https://www.rouje.com', color: '#dc2626', hot: true },
      { name: 'Sandro', url: 'https://us.sandro-paris.com', color: '#1a1a1a', hot: false },
      { name: 'Maje', url: 'https://us.maje.com', color: '#1a1a1a', hot: false },
      { name: 'Ba&sh', url: 'https://www.ba-sh.com', color: '#1a1a1a', hot: false },
      { name: 'Isabel Marant', url: 'https://www.isabelmarant.com', color: '#1a1a1a', hot: false },
      { name: 'Rixo', url: 'https://www.rixo.co.uk', color: '#f59e0b', hot: true },
      { name: 'Ghost', url: 'https://www.ghost.co.uk', color: '#e8c5c1', hot: false },
      { name: 'Self-Portrait', url: 'https://www.self-portrait-studio.com', color: '#e8c5c1', hot: true },
      { name: 'Rotate Birger Christensen', url: 'https://rotate.dk', color: '#1a1a1a', hot: true },
      { name: 'Pinko', url: 'https://www.pinko.com', color: '#dc2626', hot: false },
      { name: 'Max Mara', url: 'https://www.maxmara.com', color: '#c8a882', hot: false },
      { name: 'Club Monaco', url: 'https://www.clubmonaco.com', color: '#1a1a1a', hot: false },
      { name: 'Equipment', url: 'https://www.equipmentfr.com', color: '#1a1a1a', hot: false },
      { name: 'Vince', url: 'https://www.vince.com', color: '#1a1a1a', hot: false },
      { name: 'Theory', url: 'https://www.theory.com', color: '#1a1a1a', hot: false },
      { name: 'Cinq à Sept', url: 'https://www.cinqasept.nyc', color: '#1a1a1a', hot: false },
      { name: 'Farm Rio', url: 'https://www.farmrio.com', color: '#22c55e', hot: true },
      { name: 'Rhode', url: 'https://www.rhode.com', color: '#f59e0b', hot: true },
      { name: 'Hunza G', url: 'https://hunzag.com', color: '#f59e0b', hot: true },
      { name: 'Lisa Marie Fernandez', url: 'https://lisamariefernandez.com', color: '#f59e0b', hot: false },
      { name: 'Solid & Striped', url: 'https://www.solidandstriped.com', color: '#003da5', hot: false },
      { name: 'Toteme', url: 'https://www.toteme-studio.com', color: '#1a1a1a', hot: true },
      { name: 'The Row', url: 'https://www.therow.com', color: '#1a1a1a', hot: true },
    ],
  },
  denim: {
    label: 'Denim', icon: 'fashion', color: '#1e3a8a',
    brands: [
      { name: "Levi's", url: 'https://www.levis.com', color: '#c8102e', hot: true },
      { name: 'Diesel', url: 'https://www.diesel.com', color: '#111', hot: true },
      { name: 'Frame', url: 'https://frame-store.com', color: '#111827', hot: true },
      { name: 'Agolde', url: 'https://agolde.com', color: '#9ca3af', hot: true },
      { name: 'Citizens of Humanity', url: 'https://www.citizensofhumanity.com', color: '#1a1a1a', hot: true },
      { name: 'Mother', url: 'https://www.motherdenim.com', color: '#1a1a1a', hot: true },
      { name: 'Good American', url: 'https://www.goodamerican.com', color: '#1a1a1a', hot: false },
      { name: 'Paige', url: 'https://www.paigeusa.com', color: '#1a1a1a', hot: false },
      { name: 'Joe\'s Jeans', url: 'https://www.joesjeans.com', color: '#1a1a1a', hot: false },
      { name: 'Hudson Jeans', url: 'https://hudsonjeans.com', color: '#1a1a1a', hot: false },
      { name: '7 For All Mankind', url: 'https://www.7forallmankind.com', color: '#1a1a1a', hot: false },
      { name: 'True Religion', url: 'https://www.truereligion.com', color: '#003da5', hot: false },
      { name: 'Rock Revival', url: 'https://www.rockrevival.com', color: '#dc2626', hot: false },
      { name: 'G-Star Raw', url: 'https://www.g-star.com', color: '#003da5', hot: false },
      { name: 'Nudie Jeans', url: 'https://www.nudiejeans.com', color: '#1a1a1a', hot: false },
      { name: 'Acne Studios', url: 'https://www.acnestudios.com/denim', color: '#333', hot: false },
      { name: 'R13', url: 'https://r13denim.com', color: '#1a1a1a', hot: true },
      { name: 'Ksubi', url: 'https://www.ksubi.com', color: '#1a1a1a', hot: true },
      { name: 'Represent', url: 'https://representclo.com', color: '#1a1a1a', hot: true },
      { name: 'Wrangler', url: 'https://www.wrangler.com', color: '#003da5', hot: false },
      { name: 'Lee', url: 'https://www.lee.com', color: '#003da5', hot: false },
      { name: 'Carhartt', url: 'https://www.carhartt.com', color: '#3b3024', hot: false },
      { name: 'Edwin', url: 'https://www.edwinjeans.com', color: '#dc2626', hot: false },
      { name: 'Japan Blue', url: 'https://www.japanblue-jeans.com', color: '#003da5', hot: false },
      { name: 'Oni', url: 'https://www.oni-denim.com', color: '#003da5', hot: false },
      { name: 'Fullcount', url: 'https://fullcount.jp', color: '#003da5', hot: false },
      { name: 'Iron Heart', url: 'https://www.ironheart.co.uk', color: '#1a1a1a', hot: false },
      { name: 'Pure Blue Japan', url: 'https://www.pureBluejapan.jp', color: '#003da5', hot: false },
      { name: 'Samurai Jeans', url: 'https://www.samurai-jeans.com', color: '#dc2626', hot: false },
      { name: 'The Strike Gold', url: 'https://www.thestrikegold.com', color: '#d4af37', hot: false },
    ],
  },
  collectibles: {
    label: 'Collectibles', icon: 'kids', color: '#7e22ce',
    brands: [
      { name: 'Funko', url: 'https://www.funko.com', color: '#e31e24', hot: true },
      { name: 'Pokémon Center', url: 'https://www.pokemoncenter.com', color: '#facc15', hot: true },
      { name: 'Topps', url: 'https://www.topps.com', color: '#1d4ed8', hot: true },
      { name: 'Panini', url: 'https://www.paniniamerica.net', color: '#111827', hot: true },
      { name: 'Upper Deck', url: 'https://www.upperdeck.com', color: '#003da5', hot: true },
      { name: 'Prizm', url: 'https://www.paniniamerica.net', color: '#dc2626', hot: true },
      { name: 'Lorcana', url: 'https://www.disneylorcana.com', color: '#7c3aed', hot: true },
      { name: 'Dragon Ball Super Card', url: 'https://www.dbs-cardgame.com', color: '#f59e0b', hot: true },
      { name: 'Cardfight Vanguard', url: 'https://en.cf-vanguard.com', color: '#dc2626', hot: false },
      { name: 'Weiss Schwarz', url: 'https://en.ws-tcg.com', color: '#1a1a1a', hot: false },
      { name: 'Final Fantasy TCG', url: 'https://fftcg.square-enix-games.com', color: '#7c3aed', hot: false },
      { name: 'Flesh and Blood', url: 'https://fabtcg.com', color: '#dc2626', hot: true },
      { name: 'Altered TCG', url: 'https://www.altered.gg', color: '#22c55e', hot: false },
      { name: 'KeyForge', url: 'https://www.keyforged.com', color: '#f59e0b', hot: false },
      { name: 'Sorcery', url: 'https://sorcerytcg.com', color: '#7c3aed', hot: false },
      { name: 'Hot Toys', url: 'https://www.hottoys.com.hk', color: '#1a1a1a', hot: true },
      { name: 'NECA', url: 'https://www.necaonline.com', color: '#dc2626', hot: false },
      { name: 'McFarlane Toys', url: 'https://mcfarlane.com', color: '#22c55e', hot: false },
      { name: 'Sideshow', url: 'https://www.sideshowtoy.com', color: '#1a1a1a', hot: false },
      { name: 'Good Smile Company', url: 'https://www.goodsmile.info', color: '#e8c5c1', hot: true },
      { name: 'Kotobukiya', url: 'https://www.kotobukiya.co.jp', color: '#1a1a1a', hot: false },
      { name: 'Bandai', url: 'https://www.bandai.com', color: '#dc2626', hot: true },
      { name: 'Medicom Toy', url: 'https://www.medicomtoy.co.jp', color: '#1a1a1a', hot: true },
      { name: 'Kaws', url: 'https://kaws.com', color: '#1a1a1a', hot: true },
      { name: 'Bearbrick', url: 'https://www.medicomtoy.co.jp/bearbrick', color: '#1a1a1a', hot: true },
      { name: 'Superplastic', url: 'https://www.superplastic.co', color: '#f59e0b', hot: true },
      { name: 'Kidrobot', url: 'https://www.kidrobot.com', color: '#dc2626', hot: false },
      { name: 'Mighty Jaxx', url: 'https://mightyjaxx.com', color: '#1a1a1a', hot: true },
      { name: 'Pop Mart', url: 'https://www.popmart.com', color: '#f59e0b', hot: true },
      { name: 'Labubu', url: 'https://www.popmart.com/labubu', color: '#f59e0b', hot: true },
    ],
  },
  cards: {
    label: 'Trading Cards', icon: 'kids', color: '#2563eb',
    brands: [
      { name: 'Pokémon', url: 'https://www.pokemon.com/tcg', color: '#facc15', hot: true },
      { name: 'Yu-Gi-Oh!', url: 'https://www.yugioh-card.com', color: '#7c3aed', hot: true },
      { name: 'Magic: The Gathering', url: 'https://magic.wizards.com', color: '#dc2626', hot: true },
      { name: 'One Piece Card Game', url: 'https://en.onepiece-cardgame.com', color: '#ea580c', hot: true },
      { name: 'Topps MLB', url: 'https://www.topps.com/sports/baseball', color: '#1d4ed8', hot: true },
      { name: 'Panini NFL', url: 'https://www.paniniamerica.net/football', color: '#111827', hot: true },
      { name: 'Panini NBA', url: 'https://www.paniniamerica.net/basketball', color: '#111827', hot: true },
      { name: 'Upper Deck Hockey', url: 'https://www.upperdeck.com/hockey', color: '#003da5', hot: false },
      { name: 'Prizm Basketball', url: 'https://www.paniniamerica.net/prizm', color: '#dc2626', hot: true },
      { name: 'Select Football', url: 'https://www.paniniamerica.net/select', color: '#f59e0b', hot: true },
      { name: 'Mosaic', url: 'https://www.paniniamerica.net', color: '#7c3aed', hot: false },
      { name: 'Optic', url: 'https://www.paniniamerica.net', color: '#003da5', hot: true },
      { name: 'National Treasures', url: 'https://www.paniniamerica.net', color: '#d4af37', hot: true },
      { name: 'Flawless', url: 'https://www.paniniamerica.net', color: '#d4af37', hot: true },
      { name: 'Immaculate', url: 'https://www.paniniamerica.net', color: '#d4af37', hot: false },
      { name: 'Bowman', url: 'https://www.topps.com/bowman', color: '#1d4ed8', hot: true },
      { name: 'Topps Chrome', url: 'https://www.topps.com/chrome', color: '#c0c0c0', hot: true },
      { name: 'Stadium Club', url: 'https://www.topps.com/stadium-club', color: '#1d4ed8', hot: false },
      { name: 'Allen & Ginter', url: 'https://www.topps.com/allen-ginter', color: '#d4af37', hot: false },
      { name: 'Heritage', url: 'https://www.topps.com/heritage', color: '#1d4ed8', hot: false },
      { name: 'Garbage Pail Kids', url: 'https://www.topps.com/gpk', color: '#22c55e', hot: false },
      { name: 'WWE Topps', url: 'https://www.topps.com/wwe', color: '#dc2626', hot: false },
      { name: 'Star Wars Topps', url: 'https://www.topps.com/star-wars', color: '#1a1a1a', hot: false },
      { name: 'Marvel Topps', url: 'https://www.topps.com/marvel', color: '#dc2626', hot: false },
      { name: 'Lorcana', url: 'https://www.disneylorcana.com', color: '#7c3aed', hot: true },
      { name: 'Battle Spirits Saga', url: 'https://en.battle-spirits.com', color: '#dc2626', hot: false },
      { name: 'Grand Archive', url: 'https://www.gatcg.com', color: '#d4af37', hot: false },
      { name: 'Digimon Card', url: 'https://world.digimon.com/cardgame', color: '#003da5', hot: true },
      { name: 'Naruto Kayou', url: 'https://www.kayou.com', color: '#f97316', hot: true },
      { name: 'Gundam Card', url: 'https://p-bandai.com', color: '#dc2626', hot: false },
    ],
  },
  art: {
    label: 'Art & Prints', icon: 'home', color: '#be123c',
    brands: [
      { name: 'Desenio', url: 'https://desenio.com', color: '#111827', hot: true },
      { name: 'Society6', url: 'https://society6.com', color: '#6d28d9', hot: true },
      { name: 'Etsy Art', url: 'https://www.etsy.com/art', color: '#f97316', hot: true },
      { name: 'Minted', url: 'https://www.minted.com', color: '#22c55e', hot: true },
      { name: 'Art.com', url: 'https://www.art.com', color: '#003da5', hot: false },
      { name: 'Saatchi Art', url: 'https://www.saatchiart.com', color: '#dc2626', hot: true },
      { name: 'Artsy', url: 'https://www.artsy.net', color: '#1a1a1a', hot: false },
      { name: 'Redbubble', url: 'https://www.redbubble.com', color: '#dc2626', hot: false },
      { name: 'Threadless', url: 'https://www.threadless.com', color: '#22c55e', hot: false },
      { name: 'IFYOULOVEIT', url: 'https://ifyouloveit.com', color: '#1a1a1a', hot: false },
      { name: 'Poster Store', url: 'https://posterstore.com', color: '#1a1a1a', hot: false },
      { name: 'Juniqe', url: 'https://www.juniqe.com', color: '#1a1a1a', hot: false },
      { name: 'Icanvas', url: 'https://www.icanvas.com', color: '#003da5', hot: false },
      { name: 'Great BIG Canvas', url: 'https://www.greatbigcanvas.com', color: '#003da5', hot: false },
      { name: 'Eye Buy Art', url: 'https://www.eyebuyart.com', color: '#1a1a1a', hot: false },
      { name: 'Treecer', url: 'https://www.treecer.com', color: '#22c55e', hot: false },
      { name: 'Artur', url: 'https://www.artur.com', color: '#1a1a1a', hot: false },
      { name: 'Artfullly', url: 'https://artfullly.com', color: '#1a1a1a', hot: false },
      { name: 'Poster Lab', url: 'https://www.posterlab.co', color: '#1a1a1a', hot: false },
      { name: 'Artgeist', url: 'https://www.artgeist.com', color: '#1a1a1a', hot: false },
      { name: 'Wallsauce', url: 'https://www.wallsauce.com', color: '#1a1a1a', hot: false },
      { name: 'Wallpaper Direct', url: 'https://www.wallpaperdirect.com', color: '#1a1a1a', hot: false },
      { name: 'MuralsWallpaper', url: 'https://www.muralswallpaper.co.uk', color: '#1a1a1a', hot: false },
      { name: 'Photowall', url: 'https://www.photowall.com', color: '#1a1a1a', hot: false },
      { name: 'Desenio DE', url: 'https://desenio.de', color: '#111827', hot: false },
      { name: 'Printful', url: 'https://www.printful.com', color: '#003da5', hot: true },
      { name: 'Printify', url: 'https://printify.com', color: '#22c55e', hot: true },
      { name: 'Gelato', url: 'https://www.gelato.com', color: '#f59e0b', hot: true },
      { name: 'Fine Art America', url: 'https://fineartamerica.com', color: '#003da5', hot: false },
      { name: 'Pixels', url: 'https://pixels.com', color: '#003da5', hot: false },
    ],
  },
  office: {
    label: 'Office', icon: 'home', color: '#334155',
    brands: [
      { name: 'Herman Miller', url: 'https://www.hermanmiller.com', color: '#c8102e', hot: true },
      { name: 'Steelcase', url: 'https://www.steelcase.com', color: '#1d4ed8', hot: true },
      { name: 'Logitech', url: 'https://www.logitech.com', color: '#00b3f0', hot: true },
      { name: 'Grovemade', url: 'https://grovemade.com', color: '#8b5e3c', hot: true },
      { name: 'Humanscale', url: 'https://www.humanscale.com', color: '#1a1a1a', hot: false },
      { name: 'Haworth', url: 'https://www.haworth.com', color: '#003da5', hot: false },
      { name: 'Knoll', url: 'https://www.knoll.com', color: '#dc2626', hot: false },
      { name: 'Vitra', url: 'https://www.vitra.com', color: '#1a1a1a', hot: false },
      { name: 'Muji', url: 'https://www.muji.com/office', color: '#1a1a1a', hot: true },
      { name: 'Staples', url: 'https://www.staples.com', color: '#dc2626', hot: false },
      { name: 'Moleskine', url: 'https://www.moleskine.com', color: '#111', hot: true },
      { name: 'Leuchtturm1917', url: 'https://www.leuchtturm1917.com', color: '#1d4ed8', hot: false },
      { name: 'Rifle Paper Co.', url: 'https://riflepaperco.com', color: '#be185d', hot: true },
      { name: 'Baron Fig', url: 'https://www.baronfig.com', color: '#1a1a1a', hot: false },
      { name: 'Midori', url: 'https://www.midori-japan.co.jp', color: '#22c55e', hot: false },
      { name: 'Rhodia', url: 'https://www.rhodiapads.com', color: '#f97316', hot: false },
      { name: 'Clairefontaine', url: 'https://www.clairefontaine.com', color: '#003da5', hot: false },
      { name: 'Field Notes', url: 'https://fieldnotesbrand.com', color: '#f59e0b', hot: false },
      { name: 'Papermate', url: 'https://www.papermate.com', color: '#003da5', hot: false },
      { name: 'Pilot', url: 'https://www.pilotpen.com', color: '#dc2626', hot: false },
      { name: 'LAMY', url: 'https://www.lamy.com', color: '#1a1a1a', hot: true },
      { name: 'Montblanc', url: 'https://www.montblanc.com', color: '#1a1a1a', hot: true },
      { name: 'Parker', url: 'https://www.parkerpen.com', color: '#d4af37', hot: false },
      { name: 'Cross', url: 'https://www.cross.com', color: '#1a1a1a', hot: false },
      { name: 'Waterman', url: 'https://www.waterman.com', color: '#003da5', hot: false },
      { name: 'Kaweco', url: 'https://www.kaweco-pen.com', color: '#1a1a1a', hot: true },
      { name: 'Pelikan', url: 'https://www.pelikan.com', color: '#22c55e', hot: false },
      { name: 'Sailor', url: 'https://www.sailor.co.jp', color: '#1a1a1a', hot: false },
      { name: 'Noodler\'s Ink', url: 'https://noodlersink.com', color: '#003da5', hot: false },
      { name: 'Diamine', url: 'https://www.diamineinks.co.uk', color: '#dc2626', hot: false },
    ],
  },
  books: {
    label: 'Books & Stationery', icon: 'amazon', color: '#7c2d12',
    brands: [
      { name: 'Moleskine', url: 'https://www.moleskine.com', color: '#111', hot: true },
      { name: 'Leuchtturm1917', url: 'https://www.leuchtturm1917.com', color: '#1d4ed8', hot: false },
      { name: 'Muji Stationery', url: 'https://www.muji.com/stationery', color: '#1a1a1a', hot: true },
      { name: 'Rifle Paper Co.', url: 'https://riflepaperco.com', color: '#be185d', hot: true },
      { name: 'Penguin Books', url: 'https://www.penguin.com', color: '#f97316', hot: false },
      { name: 'Chronicle Books', url: 'https://www.chroniclebooks.com', color: '#dc2626', hot: false },
      { name: 'Taschen', url: 'https://www.taschen.com', color: '#1a1a1a', hot: true },
      { name: 'Phaidon', url: 'https://www.phaidon.com', color: '#dc2626', hot: false },
      { name: 'Rizzoli', url: 'https://www.rizzolibookstore.com', color: '#1a1a1a', hot: false },
      { name: 'Assouline', url: 'https://www.assouline.com', color: '#d4af37', hot: true },
      { name: 'Gestalten', url: 'https://gestalten.com', color: '#1a1a1a', hot: false },
      { name: 'Thames & Hudson', url: 'https://thamesandhudson.com', color: '#1a1a1a', hot: false },
      { name: 'Abrams Books', url: 'https://www.abramsbooks.com', color: '#1a1a1a', hot: false },
      { name: 'Prestel', url: 'https://www.prestel.com', color: '#1a1a1a', hot: false },
      { name: 'Dover Publications', url: 'https://www.doverpublications.com', color: '#003da5', hot: false },
      { name: 'Workman Publishing', url: 'https://www.workman.com', color: '#f59e0b', hot: false },
      { name: 'Storey Publishing', url: 'https://www.storey.com', color: '#22c55e', hot: false },
      { name: 'Ten Speed Press', url: 'https://www.tenspeed.com', color: '#f59e0b', hot: false },
      { name: 'Princeton Architectural', url: 'https://papress.com', color: '#003da5', hot: false },
      { name: 'Verso Books', url: 'https://www.versobooks.com', color: '#dc2626', hot: false },
      { name: 'MIT Press', url: 'https://mitpress.mit.edu', color: '#dc2626', hot: false },
      { name: 'University of Chicago', url: 'https://press.uchicago.edu', color: '#dc2626', hot: false },
      { name: 'Oxford University Press', url: 'https://global.oup.com', color: '#003da5', hot: false },
      { name: 'Penguin Classics', url: 'https://www.penguinrandomhouse.com/penguin-classics', color: '#000', hot: false },
      { name: 'Folio Society', url: 'https://www.foliosociety.com', color: '#d4af37', hot: true },
      { name: 'Barnes & Noble', url: 'https://www.barnesandnoble.com', color: '#1d4ed8', hot: false },
      { name: 'Bookshop.org', url: 'https://bookshop.org', color: '#22c55e', hot: true },
      { name: 'Waterstones', url: 'https://www.waterstones.com', color: '#dc2626', hot: false },
      { name: 'Book Depository', url: 'https://www.bookdepository.com', color: '#dc2626', hot: false },
      { name: 'AbeBooks', url: 'https://www.abebooks.com', color: '#dc2626', hot: false },
    ],
  },
  music: {
    label: 'Music', icon: 'electronics', color: '#7c3aed',
    brands: [
      { name: 'Marshall', url: 'https://www.marshallheadphones.com', color: '#1a1a1a', hot: true },
      { name: 'Bose', url: 'https://www.bose.com', color: '#000', hot: true },
      { name: 'JBL', url: 'https://www.jbl.com', color: '#e4002b', hot: true },
      { name: 'Audio-Technica', url: 'https://www.audio-technica.com', color: '#111827', hot: true },
      { name: 'Fender', url: 'https://www.fender.com', color: '#dc2626', hot: true },
      { name: 'Gibson', url: 'https://www.gibson.com', color: '#dc2626', hot: true },
      { name: 'Roland', url: 'https://www.roland.com', color: '#dc2626', hot: false },
      { name: 'Yamaha Music', url: 'https://usa.yamaha.com/music', color: '#003da5', hot: false },
      { name: 'Korg', url: 'https://www.korg.com', color: '#1a1a1a', hot: false },
      { name: 'Native Instruments', url: 'https://www.native-instruments.com', color: '#1a1a1a', hot: true },
      { name: 'Ableton', url: 'https://www.ableton.com', color: '#1a1a1a', hot: true },
      { name: 'Pioneer DJ', url: 'https://www.pioneerdj.com', color: '#dc2626', hot: true },
      { name: 'Denon DJ', url: 'https://www.denondj.com', color: '#1a1a1a', hot: false },
      { name: 'Rane', url: 'https://www.rane.com', color: '#dc2626', hot: false },
      { name: 'Allen & Heath', url: 'https://www.allen-heath.com', color: '#dc2626', hot: false },
      { name: 'Focusrite', url: 'https://focusrite.com', color: '#dc2626', hot: true },
      { name: 'Universal Audio', url: 'https://www.uaudio.com', color: '#1a1a1a', hot: true },
      { name: 'Rode', url: 'https://www.rode.com', color: '#dc2626', hot: true },
      { name: 'Shure', url: 'https://www.shure.com', color: '#003da5', hot: false },
      { name: 'AKG Mics', url: 'https://www.akg.com', color: '#003da5', hot: false },
      { name: 'Neumann', url: 'https://www.neumann.com', color: '#1a1a1a', hot: false },
      { name: 'Sennheiser Mics', url: 'https://www.sennheiser.com/microphones', color: '#000', hot: false },
      { name: 'Arturia', url: 'https://www.arturia.com', color: '#1a1a1a', hot: true },
      { name: 'Moog', url: 'https://www.moogmusic.com', color: '#dc2626', hot: true },
      { name: 'Teenage Engineering', url: 'https://teenage.engineering', color: '#f59e0b', hot: true },
      { name: 'Elektron', url: 'https://www.elektron.se', color: '#1a1a1a', hot: true },
      { name: 'Akai', url: 'https://www.akaipro.com', color: '#dc2626', hot: false },
      { name: 'Novation', url: 'https://novationmusic.com', color: '#dc2626', hot: false },
      { name: 'Behringer', url: 'https://www.behringer.com', color: '#003da5', hot: false },
      { name: 'IK Multimedia', url: 'https://www.ikmultimedia.com', color: '#dc2626', hot: false },
    ],
  },
};

const categories = Object.keys(NICHES);

function ActivityPill({ item, visible }) {
  const isProfit = item.action === 'profit';
  const isSold   = item.action === 'sold';
  const bgIcon   = isProfit ? '#008060' : isSold ? '#1d4ed8' : '#7c3aed';
  const iconPath = isProfit
    ? 'M10 2a8 8 0 1 1 0 16A8 8 0 0 1 10 2Zm.75 4v4.44l2.53 2.53-1.06 1.06L9.25 11V6h1.5Z'
    : isSold
    ? 'M6.5 3A1.5 1.5 0 0 0 5 4.5V6H3.5A1.5 1.5 0 0 0 2 7.5v9A1.5 1.5 0 0 0 3.5 18h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 16.5 6H15V4.5A1.5 1.5 0 0 0 13.5 3h-7ZM13.5 6h-7V4.5h7V6Z'
    : 'M2.5 9.38a1.5 1.5 0 0 1 .44-1.06L9.38 1.88A1.5 1.5 0 0 1 10.44 1.5H16.5a2 2 0 0 1 2 2v6.06a1.5 1.5 0 0 1-.44 1.06l-6.44 6.44a1.5 1.5 0 0 1-2.12 0l-6.56-6.56A1.5 1.5 0 0 1 2.5 9.38ZM13.5 7a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 10, padding: '9px 13px',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateX(0)' : 'translateX(20px)',
      transition: 'all 0.45s cubic-bezier(0.34,1.56,0.64,1)',
      minWidth: 240, maxWidth: 280,
    }}>
      <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: bgIcon, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon d={iconPath} size={15} color="#fff" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'rgba(255,255,255,0.55)' }}>{item.flag}</span>
          <span>{item.user}</span>
          {isProfit && <span style={{ color: '#69f0ae', fontWeight: 700 }}>{item.profit}</span>}
        </div>
        <div style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.5)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {isProfit ? 'profit made this session' : isSold ? `sold ${item.item} · ${item.profit}` : `imported ${item.item}`}
        </div>
      </div>
    </div>
  );
}

export default function Browse() {
  const router = useRouter();
  const { niche } = router.query;
  const tokenRef = useRef('');
  const activityQueue = useRef(shuffle(ACTIVITY_POOL));
  const activityIdx   = useRef(0);

  const [importUrl, setImportUrl]         = useState('');
  const [importing, setImporting]         = useState(false);
  const [importMsg, setImportMsg]         = useState('');
  const [embeddedUrl, setEmbeddedUrl]     = useState(null);
  const [embeddedBrand, setEmbeddedBrand] = useState(null);
  const [notifs, setNotifs]               = useState([]);
  const [notifVisible, setNotifVisible]   = useState(false);
  const [trendingSlide, setTrendingSlide] = useState(0);
  const [search, setSearch]               = useState('');
  const shop = router.query.shop || '';

  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('onshipy_token') : null;
    tokenRef.current = t || '';

    const iv = setInterval(() => {
      if (activityIdx.current >= activityQueue.current.length) {
        activityQueue.current = shuffle(ACTIVITY_POOL);
        activityIdx.current = 0;
      }
      const item = activityQueue.current[activityIdx.current++];
      setNotifs([{ ...item, id: Date.now() }]);
      setNotifVisible(true);
      setTimeout(() => setNotifVisible(false), 3500);
    }, 4000);
    return () => clearInterval(iv);
  }, []);

  const nicheData = niche && NICHES[niche];

  useEffect(() => {
    if (!nicheData) return;
    const trending = nicheData.brands.filter(b => b.hot);
    if (trending.length <= 1) return;
    const iv = setInterval(() => setTrendingSlide(s => (s + 1) % trending.length), 2600);
    return () => clearInterval(iv);
  }, [niche]);

  const handleImport = async (url) => {
    if (!url) return;
    setImporting(true); setImportMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/products/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(tokenRef.current ? { Authorization: `Bearer ${tokenRef.current}` } : {}),
        },
        body: JSON.stringify({ url, shop }),
      });
      const data = await res.json();
      if (!res.ok) { setImportMsg('error:' + (data.error || 'Failed')); return; }
      setImportMsg('success:Product imported! Go to Products to set your price.');
      setImportUrl('');
    } catch { setImportMsg('error:Connection failed'); }
    finally { setImporting(false); }
  };

  const openBrand  = brand => { setEmbeddedUrl(brand.url); setEmbeddedBrand(brand); };
  const closeEmbed = ()    => { setEmbeddedUrl(null); setEmbeddedBrand(null); setImportUrl(''); setImportMsg(''); };

  const allBrandCount   = useMemo(() => Object.values(NICHES).reduce((s, n) => s + n.brands.length, 0), []);
  const allTrendingCount = useMemo(() => Object.values(NICHES).reduce((s, n) => s + n.brands.filter(b => b.hot).length, 0), []);

  const inp = {
    flex: 1, padding: '7px 12px', border: `1px solid ${P.border}`, borderRadius: 8,
    fontSize: P.fontSize, outline: 'none', fontFamily: P.font,
    letterSpacing: P.letterSpacing, color: P.text, background: '#fff',
  };

  // ── Brand detail page ──────────────────────────────────────────────────────
  if (embeddedUrl && embeddedBrand) {
    return (
      <Layout title={`Browse — ${embeddedBrand.name}`}>
        <style>{`
          @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
          .step-card { background:#fff; border:1px solid ${P.border}; border-radius:12px; padding:20px; display:flex; gap:14px; align-items:flex-start; transition:box-shadow .15s; }
          .step-card:hover { box-shadow:0 2px 10px rgba(0,0,0,0.07); }
          .step-num { width:28px; height:28px; border-radius:50%; background:rgba(48,48,48,1); color:#fff; display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:700; flex-shrink:0; }
        `}</style>

        <div style={{ position: 'fixed', bottom: 24, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {notifs.map(n => <ActivityPill key={n.id} item={n} visible={notifVisible} />)}
        </div>

        <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px 20px 60px' }}>
          <button onClick={closeEmbed} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: P.textSubdued, fontSize: P.fontSize, fontFamily: P.font, padding: 0, marginBottom: 20, fontWeight: 500 }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
            Back to {nicheData?.label || 'Browse'}
          </button>

          <div style={{ background: embeddedBrand.color, borderRadius: 16, padding: '32px 28px', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(0,0,0,0.3) 0%,rgba(0,0,0,0) 60%)', pointerEvents: 'none' }}/>
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
              <div>
                <div style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                  {embeddedBrand.hot ? '🔥 Trending brand' : 'Brand'}
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', marginBottom: 4 }}>{embeddedBrand.name}</div>
                <div style={{ fontSize: P.fontSize, color: 'rgba(255,255,255,0.55)' }}>{embeddedUrl}</div>
              </div>
              <a href={embeddedUrl} target="_blank" rel="noreferrer" style={{ padding: '10px 22px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, color: '#fff', fontWeight: 600, fontSize: P.fontSize, textDecoration: 'none', fontFamily: P.font, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                Visit {embeddedBrand.name}
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
              </a>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: P.textSubdued, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>How to import from {embeddedBrand.name}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { n: 1, title: `Visit ${embeddedBrand.name}`, desc: 'Click "Visit" above — the site opens in a new tab', action: <a href={embeddedUrl} target="_blank" rel="noreferrer" style={{ padding: '5px 12px', background: P.text, color: '#fff', borderRadius: 6, fontSize: P.fontSize, fontWeight: 500, textDecoration: 'none', fontFamily: P.font, whiteSpace: 'nowrap' }}>Visit site</a> },
                { n: 2, title: 'Find a product to sell', desc: 'Browse their catalog — pick something with strong resell demand' },
                { n: 3, title: 'Copy the product URL', desc: 'Copy the URL from your browser address bar' },
              ].map((step, i) => (
                <div key={i} className="step-card" style={{ animation: `fadeUp .35s ease ${i * 0.07}s both` }}>
                  <div className="step-num">{step.n}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: P.fontSize, color: P.text, marginBottom: 2 }}>{step.title}</div>
                    <div style={{ fontSize: '0.75rem', color: P.textSubdued }}>{step.desc}</div>
                  </div>
                  {step.action}
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 12, border: `2px solid ${P.green}`, padding: '20px', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div className="step-num" style={{ background: P.green }}>4</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: P.fontSize, color: P.text }}>Paste the product URL to import</div>
                <div style={{ fontSize: '0.75rem', color: P.textSubdued, marginTop: 1 }}>Onshipy scrapes title, price, images and variants instantly</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input autoFocus value={importUrl} onChange={e => setImportUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleImport(importUrl)}
                placeholder={`Paste a ${embeddedBrand.name} product URL...`} style={{ ...inp, flex: 1 }} />
              <button onClick={() => handleImport(importUrl)} disabled={importing || !importUrl} style={{ padding: '7px 18px', background: importing || !importUrl ? P.bg : P.green, color: importing || !importUrl ? P.textSubdued : '#fff', border: 'none', borderRadius: 8, fontSize: P.fontSize, fontWeight: 600, cursor: importing || !importUrl ? 'not-allowed' : 'pointer', fontFamily: P.font, whiteSpace: 'nowrap' }}>
                {importing ? 'Importing...' : 'Import product'}
              </button>
            </div>
            {importMsg && (
              <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 8, fontSize: P.fontSize, background: importMsg.startsWith('error:') ? '#fee8eb' : '#cdfed4', color: importMsg.startsWith('error:') ? '#d82c0d' : '#006847', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{importMsg.replace('error:', '').replace('success:', '')}</span>
                {importMsg.startsWith('success:') && (
                  <button onClick={() => router.push('/products')} style={{ background: 'none', border: 'none', color: '#006847', cursor: 'pointer', fontWeight: 600, fontSize: P.fontSize, fontFamily: P.font }}>View products</button>
                )}
              </div>
            )}
          </div>

          {nicheData && (
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: P.textSubdued, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Other {nicheData.label} brands</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {nicheData.brands.filter(b => b.name !== embeddedBrand.name).slice(0, 12).map((b, i) => (
                  <button key={i} onClick={() => openBrand(b)} style={{ padding: '5px 12px', background: P.surface, border: `1px solid ${P.border}`, borderRadius: 20, fontSize: P.fontSize, color: P.text, cursor: 'pointer', fontFamily: P.font, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: b.color, flexShrink: 0 }}/>
                    {b.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </Layout>
    );
  }

  // ── Category grid ──────────────────────────────────────────────────────────
  if (!niche || !NICHES[niche]) {
    const filtered = search.trim()
      ? categories.filter(k => NICHES[k].label.toLowerCase().includes(search.toLowerCase()))
      : categories;

    return (
      <Layout title="Browse">
        <style>{`
          .cat-card { background:#fff; border-radius:14px; border:1px solid ${P.border}; overflow:hidden; cursor:pointer; transition:box-shadow .18s,transform .18s; }
          .cat-card:hover { box-shadow:0 4px 18px rgba(0,0,0,0.1); transform:translateY(-2px); }
          @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        `}</style>

        <div style={{ position: 'fixed', bottom: 24, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {notifs.map(n => <ActivityPill key={n.id} item={n} visible={notifVisible} />)}
        </div>

        <div style={{ padding: '24px 24px 60px', maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: '1.125rem', fontWeight: 650, color: P.text, margin: '0 0 3px', letterSpacing: '-0.02em' }}>Browse brands</h1>
              <p style={{ fontSize: P.fontSize, color: P.textSubdued, margin: 0 }}>Choose a category to discover top brands and import products directly</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: `1px solid ${P.border}`, borderRadius: 8, padding: '0 12px', height: 34, width: 240 }}>
              <svg width="13" height="13" fill="none" stroke={P.textSubdued} strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter categories..." style={{ border: 'none', outline: 'none', fontSize: P.fontSize, fontFamily: P.font, color: P.text, background: 'transparent', flex: 1 }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
            {[
              { label: 'Categories', value: categories.length },
              { label: 'Total brands', value: `${allBrandCount}+` },
              { label: 'Trending now', value: allTrendingCount },
            ].map((stat, i) => (
              <div key={i} style={{ background: '#fff', border: `1px solid ${P.border}`, borderRadius: 10, padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: P.text, letterSpacing: '-0.02em' }}>{stat.value}</div>
                <div style={{ fontSize: '0.75rem', color: P.textSubdued }}>{stat.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 14 }}>
            {filtered.map((key, i) => {
              const n = NICHES[key];
              const hotCount = n.brands.filter(b => b.hot).length;
              return (
                <div key={key} className="cat-card" onClick={() => router.push(`/browse?niche=${key}`)} style={{ animation: `fadeUp .38s ease ${i * 0.03}s both` }}>
                  <div style={{ height: 80, background: n.color, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(0,0,0,0.18) 0%,rgba(0,0,0,0) 70%)', pointerEvents: 'none' }}/>
                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon d={SVG[n.icon]} size={18} color="#fff" />
                      </div>
                      <span style={{ color: 'rgba(255,255,255,0.95)', fontWeight: 700, fontSize: '0.9375rem', letterSpacing: '-0.02em' }}>{n.label}</span>
                    </div>
                    {hotCount > 0 && (
                      <div style={{ position: 'absolute', top: 8, right: 10, display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,0,0,0.3)', borderRadius: 6, padding: '2px 7px' }}>
                        <Icon d={SVG.fire} size={10} color="rgba(255,200,0,0.9)" />
                        <span style={{ fontSize: '0.625rem', color: '#fff', fontWeight: 600 }}>{hotCount}</span>
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: P.fontSize, color: P.text }}>{n.brands.length} brands</div>
                      <div style={{ fontSize: '0.75rem', color: P.textSubdued, marginTop: 1 }}>{hotCount} trending</div>
                    </div>
                    <div style={{ width: 24, height: 24, borderRadius: 6, background: P.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="12" height="12" fill="none" stroke={P.textSubdued} strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: P.textSubdued, fontSize: P.fontSize }}>No categories match "{search}"</div>
          )}
        </div>
      </Layout>
    );
  }

  // ── Niche view ─────────────────────────────────────────────────────────────
  const trending       = nicheData.brands.filter(b => b.hot);
  const currentTrend   = trending.length ? trending[trendingSlide % trending.length] : null;
  const filteredBrands = search
    ? nicheData.brands.filter(b => b.name.toLowerCase().includes(search.toLowerCase()))
    : nicheData.brands;

  return (
    <Layout title={`Browse — ${nicheData.label}`}>
      <style>{`
        .brand-card { background:#fff; border-radius:10px; border:1px solid ${P.border}; overflow:hidden; cursor:pointer; transition:box-shadow .15s,transform .15s; }
        .brand-card:hover { box-shadow:0 4px 14px rgba(0,0,0,0.1); transform:translateY(-1px); }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .trend-slide { animation:fadeIn 0.45s ease; }
      `}</style>

      <div style={{ position: 'fixed', bottom: 24, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {notifs.map(n => <ActivityPill key={n.id} item={n} visible={notifVisible} />)}
      </div>

      <div style={{ padding: '20px 24px 60px', maxWidth: 1160, margin: '0 auto' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, fontSize: P.fontSize, color: P.textSubdued }}>
          <button onClick={() => { setSearch(''); router.push('/browse'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: P.green, fontSize: P.fontSize, fontFamily: P.font, padding: 0, fontWeight: 500 }}>Browse</button>
          <svg width="12" height="12" fill="none" stroke={P.textSubdued} strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
          <span style={{ color: P.text, fontWeight: 500 }}>{nicheData.label}</span>
        </div>

        {/* Heading */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: nicheData.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon d={SVG[nicheData.icon]} size={18} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.125rem', fontWeight: 650, color: P.text, margin: '0 0 2px', letterSpacing: '-0.02em' }}>{nicheData.label}</h1>
              <p style={{ fontSize: P.fontSize, color: P.textSubdued, margin: 0 }}>Click any brand to view import instructions</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: P.surface, border: `1px solid ${P.border}`, borderRadius: 20, fontSize: '0.75rem', color: P.textSubdued }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse 1.5s infinite' }}/>
            {trending.length} trending
          </div>
        </div>

        {/* Trending spotlight */}
        {currentTrend && (
          <div key={trendingSlide} className="trend-slide" style={{ background: currentTrend.color, borderRadius: 12, padding: '20px 24px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', overflow: 'hidden', position: 'relative', minHeight: 96 }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0) 60%)', pointerEvents: 'none' }}/>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#69f0ae', display: 'inline-block', animation: 'pulse 1.5s infinite' }}/>
                Trending now in {nicheData.label}
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: 3 }}>{currentTrend.name}</div>
              <div style={{ fontSize: P.fontSize, color: 'rgba(255,255,255,0.65)' }}>High resell demand · Import ready</div>
            </div>
            <div style={{ display: 'flex', gap: 8, position: 'relative', zIndex: 1 }}>
              <button onClick={() => openBrand(currentTrend)} style={{ padding: '8px 18px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 8, color: '#fff', fontSize: P.fontSize, fontWeight: 600, cursor: 'pointer', fontFamily: P.font }}>
                Browse {currentTrend.name}
              </button>
            </div>
            <div style={{ position: 'absolute', bottom: 10, right: 16, display: 'flex', gap: 5 }}>
              {trending.map((_, i) => (
                <div key={i} onClick={() => setTrendingSlide(i)} style={{ width: i === trendingSlide % trending.length ? 16 : 6, height: 6, borderRadius: 3, background: i === trendingSlide % trending.length ? '#fff' : 'rgba(255,255,255,0.35)', cursor: 'pointer', transition: 'width .3s' }}/>
              ))}
            </div>
          </div>
        )}

        {/* Import bar */}
        <div style={{ background: P.surface, borderRadius: 12, border: `1px solid ${P.border}`, padding: '14px 18px', marginBottom: 20 }}>
          <div style={{ fontWeight: 600, fontSize: P.fontSize, color: P.text, marginBottom: 8 }}>Import a product</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={importUrl} onChange={e => setImportUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleImport(importUrl)} placeholder="Paste any product URL here..." style={inp} />
            <button onClick={() => handleImport(importUrl)} disabled={importing || !importUrl} style={{ padding: '7px 16px', background: importing || !importUrl ? P.bg : P.text, color: importing || !importUrl ? P.textSubdued : '#fff', border: `1px solid ${P.border}`, borderRadius: 8, fontSize: P.fontSize, fontWeight: 500, cursor: importing || !importUrl ? 'not-allowed' : 'pointer', fontFamily: P.font, whiteSpace: 'nowrap' }}>
              {importing ? 'Importing...' : 'Import'}
            </button>
          </div>
          {importMsg && (
            <div style={{ marginTop: 8, padding: '7px 12px', borderRadius: 8, fontSize: P.fontSize, background: importMsg.startsWith('error:') ? '#fee8eb' : '#cdfed4', color: importMsg.startsWith('error:') ? '#d82c0d' : '#006847', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{importMsg.replace('error:', '').replace('success:', '')}</span>
              {importMsg.startsWith('success:') && (
                <button onClick={() => router.push('/products')} style={{ background: 'none', border: 'none', color: '#006847', cursor: 'pointer', fontWeight: 600, fontSize: P.fontSize, fontFamily: P.font }}>View products</button>
              )}
            </div>
          )}
        </div>

        {/* Top brands scroll rail */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: P.textSubdued, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon d={SVG.fire} size={12} color={P.textSubdued} />
            Top {Math.min(10, nicheData.brands.length)} most resold
          </div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
            {nicheData.brands.slice(0, 10).map((brand, i) => (
              <div key={i} onClick={() => openBrand(brand)} style={{ flexShrink: 0, width: 120, background: P.surface, borderRadius: 10, border: `1px solid ${P.border}`, overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow .15s' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                <div style={{ height: 60, background: brand.color, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 800, fontSize: '1.375rem', letterSpacing: '-0.03em' }}>{brand.name[0]}</span>
                  <div style={{ position: 'absolute', top: 4, left: 7, fontSize: '0.625rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>#{i + 1}</div>
                  {brand.hot && <div style={{ position: 'absolute', top: 4, right: 6, background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.5rem', fontWeight: 700, padding: '1px 5px', borderRadius: 8, letterSpacing: '0.05em' }}>HOT</div>}
                </div>
                <div style={{ padding: '8px 10px' }}>
                  <div style={{ fontWeight: 500, fontSize: '0.75rem', color: P.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{brand.name}</div>
                  <div style={{ fontSize: '0.625rem', color: P.green, marginTop: 1, fontWeight: 500 }}>Browse</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All brands grid */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, gap: 10, flexWrap: 'wrap' }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: P.textSubdued, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              All brands ({nicheData.brands.length})
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: `1px solid ${P.border}`, borderRadius: 8, padding: '0 10px', height: 30 }}>
              <svg width="12" height="12" fill="none" stroke={P.textSubdued} strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter brands..." style={{ border: 'none', outline: 'none', fontSize: '0.75rem', fontFamily: P.font, color: P.text, background: 'transparent', width: 120 }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))', gap: 10 }}>
            {filteredBrands.map((brand, i) => (
              <div key={i} className="brand-card" onClick={() => openBrand(brand)}>
                <div style={{ height: 58, background: brand.color, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>{brand.name[0]}</span>
                  {brand.hot && <div style={{ position: 'absolute', top: 4, right: 6, background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.5rem', fontWeight: 700, padding: '1px 5px', borderRadius: 8, letterSpacing: '0.05em' }}>HOT</div>}
                </div>
                <div style={{ padding: '8px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 500, fontSize: '0.75rem', color: P.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{brand.name}</div>
                  <svg width="11" height="11" fill="none" stroke={P.textSubdued} strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              </div>
            ))}
          </div>
          {filteredBrands.length === 0 && (
            <div style={{ textAlign: 'center', padding: '30px 0', color: P.textSubdued, fontSize: P.fontSize }}>No brands match "{search}"</div>
          )}
        </div>
      </div>
    </Layout>
  );
}