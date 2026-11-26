/*
  DATA LIRIK
  Tempel lirik + timestamp milikmu di antara tanda backtick di bawah.
  Format tiap baris (satu baris lirik = dua baris data):

  [menit:detik.sepuluhan]Teks baris
  <kata:mulai:selesai|kata:mulai:selesai>

  Contoh format (teks contoh, bukan lirik asli):
  [00:10.50]Kata satu kata dua
  <Kata:10.5:11.2|satu:11.2:12.0|kata:12.0:12.6|dua:12.6:14.0>

  Waktu kata dalam detik desimal. Baris tanpa baris <...> disinkronkan
  berdasarkan timestamp [mm:ss.xx] saja.
*/
window.LYRICS_RAW = `

`;
