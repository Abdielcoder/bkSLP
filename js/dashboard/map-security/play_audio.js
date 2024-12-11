import { snap_warning, snap_panic, eiby_panic, eiby_warning } from "../../config/config.js";

const panic_audio = document.querySelector("audio#panic-audio");
const warnig_audio = document.querySelector("audio#warning-audio");

panic_audio.addEventListener("ended", e => { e.target.pause(); });
warnig_audio.addEventListener("ended", e => { e.target.pause(); });

snap_warning.on("child_added", async snap => {
  try {
    if (!warnig_audio.paused && warnig_audio.duration > 0) return;
    await warnig_audio.play();
  } catch (err) { console.log(err) }
});

snap_panic.on("child_added", async snap => {
  try {
    if (!panic_audio.paused && panic_audio.duration > 0) return;
    await panic_audio.play();
  } catch (err) { console.log(err) }
});

eiby_warning.on("child_added", async snap => {
  try {
    if (!warnig_audio.paused && warnig_audio.duration > 0) return;
    await warnig_audio.play();
  } catch (err) { console.log(err) }
});

eiby_panic.on("child_added", async snap => {
  try {
    if (!panic_audio.paused && panic_audio.duration > 0) return;
    await panic_audio.play();
  } catch (err) { console.log(err) }
});