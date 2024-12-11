import { WARNING_ALERTS_REFERENCE, PANIC_ALERTS_REFERENCE, GLOBAL_ALL_DRIVERS_ARRAY   } from "./functionality.js";
const firestore = firebase.firestore();
const warning_logs = firestore.collection("WarningLogs");
const panic_logs = firestore.collection("PanicLogs");
const search_bar = document.getElementById("searching-bar");
const map_container_buttons = document.querySelectorAll("button.map-data");
const alerts_modal = document.querySelector("div.modal.alerts-modal");
const close_modal = document.querySelector("a.close");
const alert_box = document.querySelector("div.modal-alert-box");
const alert_box_confirm = document.querySelector("button.confirm-button");
const alert_box_close = document.querySelector("button.cancel-button");
const eye = { v: "../assets/svg/visible.svg", h: "../assets/svg/hidden.svg" };

search_bar.addEventListener("keyup", (e) => {
  const keyValue = e.target.value;
  searchDataFromList(keyValue.toUpperCase());
});

const searchDataFromList = (val) => {
  const list_rows = document.querySelectorAll("table#data-list tbody tr");

  for (let i = 0; i < list_rows.length; i++) {
    const td = list_rows[i].children[0];

    const phone = td.getAttribute("data-phone");
    const licence = td.getAttribute("data-licence");
    const num_economic = td.getAttribute("data-num");
    const plate = td.firstElementChild.textContent;
    if (!plate.includes(val)) {
      if (!licence.includes(val)) {
        if (!num_economic.includes(val)) {
          if (!phone.includes(val)) {
            list_rows[i].style.display = "none";
            continue;
          }
        }
      }
    }
    list_rows[i].style.display = "table-row";
  }
  if (val === "") {
    list_rows.forEach((item) => {
      item.style.display = item.getAttribute("data-type") === "inactive" ? "none" : "table-row";
    });
  }
};

map_container_buttons.forEach((item) => {
  item.addEventListener("click", (e) => {
    // if (item.classList.contains("warpan")) {
    //   alerts_modal.style.display = "block";
    //   return;
    // }

    const self = e.currentTarget;
    const event = self.getAttribute("data-event");

    if (event === undefined || event === null || event === "inactive") return;

    const toggle_eye = self.getAttribute("data-vision");
    const icon_eye = self.children[0].children[0];

    if (toggle_eye === "true" || toggle_eye === true) {
      icon_eye.setAttribute("src", eye.h);
      self.setAttribute("data-vision", "false");
    } else {
      icon_eye.setAttribute("src", eye.v);
      self.setAttribute("data-vision", "true");
    }
    verifyCodeOfButtonFilter(eye);

    return;
  });
});

const verifyCodeOfButtonFilter = (eye) => {
  const elements = document.querySelectorAll("button.map-data.button-toggle-filter");
  let code = "";
  elements.forEach((item) => {
    const isTrue = item.getAttribute("data-vision");
    code = isTrue === true || isTrue === "true" ? code + "1" : code + "0";
  });
  filterMarkersFromMapByCode(code, elements, eye);
};

const filterMarkersFromMapByCode = (code, array, eye) => {
  const markers_in_map = document.querySelectorAll("img.leaflet-marker-icon");

  if (code === "0000" || code === "1100" || code === "0011") {
    markers_in_map.forEach((item) => {
      item.style.display = "none";
    });
    array.forEach((button) => {
      button.setAttribute("data-vision", "false");
      const icon_eye = button.children[0].children[0];
      icon_eye.setAttribute("src", eye.h);
    });
  }

  // ALL
  if (code === "1111") {
    markers_in_map.forEach((item) => {
      const type = item.getAttribute("data-type");
      if (type !== "inactive") {
        item.style.display = "block";
      }
    });
    return;
  }

  // Sitio + Active
  if (code === "1001") {
    markers_in_map.forEach((item) => {
      const type = item.getAttribute("data-type");
      if (type !== "inactive") {
        const service = item.getAttribute("data-service");
        if (type === "active" && service === "sitio") {
          item.style.display = "block";
        } else {
          item.style.display = "none";
        }
      }
    });
    return;
  }

  // Sitio + Working
  if (code === "1010") {
    markers_in_map.forEach((item) => {
      const type = item.getAttribute("data-type");
      if (type !== "inactive") {
        const service = item.getAttribute("data-service");
        if (type === "working" && service === "sitio") {
          item.style.display = "block";
        } else {
          item.style.display = "none";
        }
      }
    });
    return;
  }

  // Libre + (Working & Active)
  if (code === "1011") {
    markers_in_map.forEach((item) => {
      const type = item.getAttribute("data-type");
      if (type !== "inactive") {
        const service = item.getAttribute("data-service");
        if (service !== "libre") {
          item.style.display = "block";
        } else {
          item.style.display = "none";
        }
      }
    });
    return;
  }

  // Libre + (Working & Active)
  if (code === "0111") {
    markers_in_map.forEach((item) => {
      const type = item.getAttribute("data-type");
      if (type !== "inactive") {
        const service = item.getAttribute("data-service");
        if (service !== "sitio") {
          item.style.display = "block";
        } else {
          item.style.display = "none";
        }
      }
    });
    return;
  }

  // Libre + Active
  if (code === "0101") {
    markers_in_map.forEach((item) => {
      const type = item.getAttribute("data-type");
      if (type !== "inactive") {
        const service = item.getAttribute("data-service");
        if (type === "active" && service === "libre") {
          item.style.display = "block";
        } else {
          item.style.display = "none";
        }
      }
    });
    return;
  }

  // Libre + Working
  if (code === "0110") {
    markers_in_map.forEach((item) => {
      const type = item.getAttribute("data-type");
      if (type !== "inactive") {
        const service = item.getAttribute("data-service");
        if (type === "working" && service === "libre") {
          item.style.display = "block";
        } else {
          item.style.display = "none";
        }
      }
    });
    return;
  }

  // (Sitio & Libre) + Active
  if (code === "1101") {
    markers_in_map.forEach((item) => {
      const type = item.getAttribute("data-type");
      if (type !== "inactive" && type !== "working") {
        item.style.display = "block";
      } else {
        item.style.display = "none";
      }
    });
    return;
  }

  // (Sitio & Libre) + Working
  if (code === "1110") {
    markers_in_map.forEach((item) => {
      const type = item.getAttribute("data-type");
      if (type !== "inactive" && type !== "active") {
        item.style.display = "block";
      } else {
        item.style.display = "none";
      }
    });
    return;
  }

  // Sitio
  if (code === "1000") {
    markers_in_map.forEach((item) => {
      const type = item.getAttribute("data-type");
      const service = item.getAttribute("data-service");
      if (service === "sitio" && type !== "inactive") {
        item.style.display = "block";
      } else {
        item.style.display = "none";
      }
    });
    array.forEach((button, index, arr) => {
      if (index === 2 || index === 3) {
        arr[index].setAttribute("data-vision", "true");
        const icon_eye = button.children[0].children[0];
        icon_eye.setAttribute("src", eye.v);
      }
    });
    return;
  }

  // Libre
  if (code === "0100") {
    markers_in_map.forEach((item) => {
      const type = item.getAttribute("data-type");
      const service = item.getAttribute("data-service");
      if (service === "libre" && type !== "inactive") {
        item.style.display = "block";
      } else {
        item.style.display = "none";
      }
    });
    array.forEach((button, index, arr) => {
      if (index === 2 || index === 3) {
        arr[index].setAttribute("data-vision", "true");
        const icon_eye = button.children[0].children[0];
        icon_eye.setAttribute("src", eye.v);
      }
    });
    return;
  }

  // Working
  if (code === "0010") {
    markers_in_map.forEach((item) => {
      const type = item.getAttribute("data-type");
      if (type !== "inactive" && type !== "active") {
        item.style.display = "block";
      } else {
        item.style.display = "none";
      }
    });
    array.forEach((button, index, arr) => {
      if (index === 0 || index === 1) {
        arr[index].setAttribute("data-vision", "true");
        const icon_eye = button.children[0].children[0];
        icon_eye.setAttribute("src", eye.v);
      }
    });
    return;
  }

  // Active
  if (code === "0001") {
    markers_in_map.forEach((item) => {
      const type = item.getAttribute("data-type");
      if (type !== "inactive" && type !== "active") {
        item.style.display = "block";
      } else {
        item.style.display = "none";
      }
    });
    array.forEach((button, index, arr) => {
      if (index === 0 || index === 1) {
        arr[index].setAttribute("data-vision", "true");
        const icon_eye = button.children[0].children[0];
        icon_eye.setAttribute("src", eye.v);
      }
    });
    return;
  }
};

close_modal.addEventListener("click", (e) => {
  alerts_modal.style.display = "none";
});

alert_box_close.addEventListener("click", (event) => {
  limpiarFormulario()
  alert_box.style.display = "none";
});

//Limpia el formulario alert-box
function limpiarFormulario() {
  document.querySelector("input#folio").value = "";
  document.querySelector("input#descripcion").value = "";
  document.querySelector("input#seguimiento").value = "";
  document.querySelector("input#observaciones").value = "";
  document.querySelector("input#fakeAlert").checked = false;
  document.querySelector("input#finishedEvent").checked = false;
}


alert_box_confirm.addEventListener("click", (e) => {
  const confirm_msg = "La alerta será atendida y registrada en un histórico en la base de datos. ¿Desea continuar?";
  if (confirm(confirm_msg)) {
    const id = alert_box.getAttribute("data-id");
    const type = alert_box.getAttribute("data-type"); 
    attendAlertFromListModal(type, id);
  }
  return;
});

const attendAlertFromListModal = (type, uid) => { 
  const driver = GLOBAL_ALL_DRIVERS_ARRAY.find((item) => item.uid === uid);
  const datetime = getFormatedTimeStamp();
  const payload = {
    folio         : document.querySelector("input#folio").value ?? "",
    descripcion   : document.querySelector("input#descripcion").value ?? "",
    seguimiento   : document.querySelector("input#seguimiento").value ?? "",
    observaciones : document.querySelector("input#observaciones").value ?? "",
    fakeAlert     : document.querySelector("input#fakeAlert").checked ?? false,
    finishedEvent : document.querySelector("input#finishedEvent").checked ?? false,
    adminEmail    : sessionStorage.getItem("email"),
    adminUID      : sessionStorage.getItem("user"),
    timestamp     : new Date().toISOString(),
    tipo          : "warning", 
    conductorUID  : driver.uid,
    conductorNombre  : driver.nombreChofer
  }
    firestore
      .collection("LogsAlertas")
      .add(payload)
      .then((success) => {
        const row = document.querySelector(`tr.${type}-list_${uid}`);
        if (row.parentElement.childElementCount === 1) {
          alerts_modal.style.display = "none";
        }
        alert_box.style.display = "none";
        row.remove();
      })
      .then((final) => {
        WARNING_ALERTS_REFERENCE.child(uid).remove();
        const aside_row = document.querySelector(`tr.tr_${uid}[data-type='${type}']`) || false;
        if (aside_row !== false) aside_row.remove();
        alert("Se ha atendido la alerta de manera correcta.");
      })
      .catch(() => {
        console.log("Error al registrar la alerta en la base de datos.");
      });

}

const getFormatedTimeStamp = () => {
  let dateClass = new Date();
  const timestamp = dateClass.toString().split("GMT")[0];
  const DD = dateClass.getDate();
  const MM = dateClass.getMonth() + 1;
  const YY = dateClass.getFullYear();
  const hour = dateClass.getHours();
  const mins = dateClass.getMinutes();
  const segs = dateClass.getSeconds();
  const mseg = dateClass.getMilliseconds();
  return {
    unformatted: timestamp,
    formated: YY + "_" + MM + "_" + DD + "_" + hour + "_" + mins + "_" + segs + "_" + mseg,
  };
};


