-- Generated from public/data/resorts.json.
-- Fields used: slug, nameEn, locationEn, lat, lng. Country is Japan.
-- Run this after the migration. Re-running updates names and coordinates.

insert into public.resorts (slug, name, country, region, lat, lng)
values
  ('grand-hirafu', 'Grand Hirafu', 'Japan', 'Kutchan, Hokkaido', 42.8645, 140.688),
  ('hanazono', 'Hanazono', 'Japan', 'Kutchan, Hokkaido', 42.8785, 140.708),
  ('niseko-village', 'Niseko Village', 'Japan', 'Niseko, Hokkaido', 42.848, 140.665),
  ('annupuri', 'Annupuri', 'Japan', 'Niseko, Hokkaido', 42.855, 140.651),
  ('moiwa', 'Moiwa', 'Japan', 'Niseko, Hokkaido', 42.837, 140.638),
  ('rusutsu', 'Rusutsu', 'Japan', 'Rusutsu, Hokkaido', 42.749, 140.898),
  ('kiroro', 'Kiroro', 'Japan', 'Akaigawa, Hokkaido', 43.068, 140.996),
  ('sapporo-teine', 'Sapporo Teine', 'Japan', 'Teine-ku, Sapporo', 43.084, 141.208),
  ('sapporo-kokusai', 'Sapporo Kokusai', 'Japan', 'Minami-ku, Sapporo', 42.979, 141.237),
  ('asarigawa-onsen', 'Asarigawa Onsen', 'Japan', 'Otaru, Hokkaido', 43.147, 141.035),
  ('furano', 'Furano', 'Japan', 'Furano, Hokkaido', 43.334, 142.354),
  ('tomamu', 'Tomamu', 'Japan', 'Shimukappu, Hokkaido', 43.055, 142.611),
  ('kamui-ski-links', 'Kamui Ski Links', 'Japan', 'Asahikawa, Hokkaido', 43.67, 142.195),
  ('asahidake', 'Asahidake', 'Japan', 'Higashikawa, Hokkaido', 43.651, 142.796),
  ('sahoro', 'Sahoro', 'Japan', 'Shintoku, Hokkaido', 43.168, 142.808),
  ('appi-kogen', 'Appi Kogen', 'Japan', 'Hachimantai, Iwate', 40.0002, 140.9388),
  ('zao-onsen', 'Zao Onsen', 'Japan', 'Yamagata', 38.163, 140.439),
  ('alts-bandai', 'Alts Bandai', 'Japan', 'Bandai, Fukushima', 37.601, 140.075),
  ('geto-kogen', 'Geto Kogen', 'Japan', 'Kitakami, Iwate', 39.205, 140.888),
  ('gala-yuzawa', 'Gala Yuzawa', 'Japan', 'Yuzawa, Niigata', 36.947, 138.803),
  ('kagura', 'Kagura', 'Japan', 'Yuzawa, Niigata', 36.86, 138.78),
  ('naeba', 'Naeba', 'Japan', 'Yuzawa, Niigata', 36.793, 138.783),
  ('ishiuchi-maruyama', 'Ishiuchi Maruyama', 'Japan', 'Minamiuonuma, Niigata', 36.978, 138.808),
  ('maiko', 'Maiko Snow Resort', 'Japan', 'Minamiuonuma, Niigata', 36.985, 138.845),
  ('happo-one', 'Happo-One', 'Japan', 'Hakuba, Nagano', 36.702, 137.837),
  ('hakuba-47', 'Hakuba 47 / Goryu', 'Japan', 'Hakuba, Nagano', 36.698, 137.848),
  ('tsugaike', 'Tsugaike', 'Japan', 'Otari, Nagano', 36.758, 137.854),
  ('iwatake', 'Hakuba Iwatake', 'Japan', 'Hakuba, Nagano', 36.707, 137.861),
  ('nozawa-onsen', 'Nozawa Onsen', 'Japan', 'Nozawaonsen, Nagano', 36.922, 138.456),
  ('shiga-kogen', 'Shiga Kogen', 'Japan', 'Yamanouchi, Nagano', 36.716, 138.506),
  ('madarao', 'Madarao', 'Japan', 'Iiyama, Nagano', 36.845, 138.283),
  ('akakura-onsen', 'Akakura Onsen', 'Japan', 'Myoko, Niigata', 36.894, 138.155),
  ('suginohara', 'Myoko Suginohara', 'Japan', 'Myoko, Niigata', 36.877, 138.137),
  ('kawaba', 'Kawaba', 'Japan', 'Kawaba, Gunma', 36.746, 139.106),
  ('kusatsu-onsen', 'Kusatsu Onsen', 'Japan', 'Kusatsu, Gunma', 36.623, 138.596),
  ('tanigawadake', 'Tanigawadake Tenjindaira', 'Japan', 'Minakami, Gunma', 36.817, 138.929),
  ('fujiten', 'Fujiten Snow Resort', 'Japan', 'Narusawa, Yamanashi', 35.428, 138.745)
on conflict (slug) do update set
  name = excluded.name,
  country = excluded.country,
  region = excluded.region,
  lat = excluded.lat,
  lng = excluded.lng;
