// document.querySelectorAll(".main-tab-link").forEach(tab => {
//     tab.addEventListener("click", function () {
//         const target = this.getAttribute("data-tab");

//         // bütün tabları deaktiv et
//         document.querySelectorAll(".main-tab-link").forEach(t => {
//             t.classList.remove("text-messages", "border-b-2", "border-messages", "cursor-default");
//             t.classList.add("cursor-pointer");
//         });

//         // seçilən taba active class-larını əlavə et
//         this.classList.add("text-messages", "border-b-2", "border-messages", "cursor-default");
//         this.classList.remove("cursor-pointer");

//         // bütün content-ləri gizlət
//         document.querySelectorAll(".tab-content").forEach(content => {
//             content.classList.add("hidden");
//         });

//         // seçilən content-i göstər
//         document.getElementById(target).classList.remove("hidden");

//         // seçilən tab-a əsasən uyğun TableWrapper göstər
//         showTab(target);
//     });
// });

// function showTab(tab) {
//     if (tab === "qr") {
//       $("#qrTableWrapper").show();
//       $("#sorgularTableWrapper").hide();
//     } else {
//       $("#qrTableWrapper").hide();
//       $("#sorgularTableWrapper").show();
//     }
// }

// // Səhifə açıldıqda default olaraq QR tab göstərilsin
// document.addEventListener("DOMContentLoaded", function() {
//     document.querySelector('.main-tab-link[data-tab="qr"]').click();
// });


document.querySelectorAll(".main-tab-link").forEach(tab => {
    tab.addEventListener("click", function () {
        const target = this.getAttribute("data-tab");

        // bütün tabları deaktiv et
        document.querySelectorAll(".main-tab-link").forEach(t => {
            t.classList.remove("text-messages", "border-b-2", "border-messages", "cursor-default");
            t.classList.add("cursor-pointer");
        });

        // seçilən taba active class-larını əlavə et
        this.classList.add("text-messages", "border-b-2", "border-messages", "cursor-default");
        this.classList.remove("cursor-pointer");

        // bütün content-ləri gizlət
        document.querySelectorAll(".tab-content").forEach(content => {
            content.classList.add("hidden");
        });

        // seçilən content-i göstər
        document.getElementById(target).classList.remove("hidden");

        // seçilən tab-a əsasən uyğun TableWrapper göstər
        showTab(target);
    });
});

function showTab(tab) {
    if (tab === "statistika") {
        $("#statistika").show()
    }
    else if (tab === "mükafatlar") {
        $("#mükafatlar").show()
    }
    else if (tab === "tranzaksiyalar") {
        $("#tranzaksiyalar").show()
    }
    else if (tab === "əməliyyat tarixçəsi") {
        $("#əməliyyat tarixçəsi").show()
    }
    else if (tab === "imtiyaz kartları") {
        $("#imtiyaz kartları").show()
    }
    else if (tab === "rozetlər") {
        $("#rozetlər").show()
    }
    else if (tab === "sorğular") {
        $("#sorğular").show()
    }
    // if (tab === "qr") {
    //   $("#qrTableWrapper").show();
    //   $("#sorgularTableWrapper").hide();
    // } else {
    //   $("#qrTableWrapper").hide();
    //   $("#sorgularTableWrapper").show();
    // }
}

// Səhifə açıldıqda default olaraq QR tab göstərilsin
// document.addEventListener("DOMContentLoaded", function() {
//     document.querySelector('.main-tab-link[data-tab="qr"]').click();
// });
//STATISTIKA POPUP_________________________________________________________
function openIllerDropdown() {
    document.getElementById("illerDropdown").classList.remove("hidden");
}

function closeIllerDropdown() {
    document.getElementById("illerDropdown").classList.add("hidden");
    document.getElementById("searchIller").value = '';

    document.querySelectorAll("#illerList label").forEach(label => {
        const text = label.textContent.toLowerCase();
        label.style.display = "flex"
    });
}

function clearIllerFilters() {
    document.querySelectorAll("#illerList input[type='checkbox']").forEach(cb => cb.checked = false);
}

function filterIllerList() {
    const search = document.getElementById("searchIller").value.toLowerCase();
    document.querySelectorAll("#illerList label").forEach(label => {
        const text = label.textContent.toLowerCase();
        label.style.display = text.includes(search) ? "flex" : "none";
    });
}
function openSirketlerDropdown() {
    document.getElementById("sirketlerDropdown").classList.remove("hidden");
}

function closeSirketlerDropdown() {
    document.getElementById("sirketlerDropdown").classList.add("hidden");
    document.getElementById("searchSirketler").value = '';
    document.querySelectorAll("#sirketlerList label").forEach(label => {

        label.style.display = "flex"
    });

}

function clearSirketlerFilters() {
    document.querySelectorAll("#sirketlerList input[type='checkbox']").forEach(cb => cb.checked = false);
}


function filterSirketlerList() {
    const search = document.getElementById("searchSirketler").value.toLowerCase();
    document.querySelectorAll("#sirketlerList label").forEach(label => {
        const text = label.textContent.toLowerCase();
        label.style.display = text.includes(search) ? "flex" : "none";
    });
}

function openİmtiyazlarDropdown() {
    document.getElementById("imtiyazlarDropdown").classList.remove("hidden");

}
function openİmtiyazlarXercDropdown1() {
    const dropdown = document.getElementById("imtiyazlarXercDropdown1");
    if(dropdown) {
        dropdown.classList.remove("hidden");
    } else {
        console.error("Dropdown tapılmadı!");
    }
}
function closeİmtiyazlarXercDropdown1 () {
    const dropdown = document.getElementById("imtiyazlarXercDropdown1");
    if(dropdown) {
        dropdown.classList.add("hidden");
    } else {
        console.error("Dropdown tapılmadı!");
    }
}


function closeİmtiyazlarDropdown() {
    document.getElementById("imtiyazlarDropdown").classList.add("hidden");
    document.getElementById("searchİmtiyazlar").value = '';
    document.querySelectorAll("#imtiyazlarList label").forEach(label => {

        label.style.display = "flex"
    });

}

function clearİmtiyazlarFilters1() {
    document.querySelectorAll("#imtiyazlarList input[type='checkbox']").forEach(cb => cb.checked = false);
}

function filterİmtiyazlarXercList () {
    const search = document.getElementById("searchİmtiyazlar").value.toLowerCase();
    document.querySelectorAll("#imtiyazlarList label").forEach(label => {
        const text = label.textContent.toLowerCase();
        label.style.display = text.includes(search) ? "flex" : "none";
    });
}

function openXerclemeDropdown() {
    document.getElementById("xerclemeDropdown").classList.remove("hidden");
}

function closeXerclemeDropdown() {
    document.getElementById("xerclemeDropdown").classList.add("hidden");
    document.getElementById("searchXercleme").value = '';
    document.querySelectorAll("#xerclemeList label").forEach(label => {

        label.style.display = "flex"
    });

}

function clearXerclemeFilters() {
    document.querySelectorAll("#xerclemeList input[type='checkbox']").forEach(cb => cb.checked = false);
}

function applyXerclemeFilters() {
    const selected = Array.from(document.querySelectorAll("#xerclemeList input:checked"))
        .map(cb => cb.value);
    closeXerclemeDropdown();
}

function filterXerclemeList() {
    const search = document.getElementById("searchXercleme").value.toLowerCase();
    document.querySelectorAll("#xerclemeList label").forEach(label => {
        const text = label.textContent.toLowerCase();
        label.style.display = text.includes(search) ? "flex" : "none";
    });
}

function closeArtimModal() {
    document.getElementById("artimPopUp").classList.add('hidden')
}
document.getElementById('artimFilter').addEventListener('click', (e) => {
    document.getElementById("artimPopUp").classList.remove('hidden')


})
document.getElementById('artimPopUp').addEventListener('click', (e) => {
    const div = document.getElementById('artim-div');
    // If the click is NOT inside the popup content, hide the popup
    if (!div.contains(e.target)) {
        document.getElementById("artimPopUp").classList.add('hidden');
    }
});



function applyXercFilters() {
    document.getElementById("xercPopUp").classList.add('hidden');

}
document.getElementById('xercPopUp').addEventListener('click', (e) => {
    const div = document.getElementById('xerc-div');
    // If the click is NOT inside the popup content, hide the popup
    if (!div.contains(e.target)) {
        document.getElementById("xercPopUp").classList.add('hidden');
    }
});
function closeXercModal() {
    document.getElementById("xercPopUp").classList.add('hidden')
}
document.getElementById('xercFilter').addEventListener('click', (e) => {
    document.getElementById("xercPopUp").classList.remove('hidden')
})
function clearXercFilters() {
    document.querySelectorAll("#xercPopUp input[type='checkbox']").forEach(cb => cb.checked = false);

}

function openIllerXercDropdown1() {
    document.getElementById("illerXercDropdown1").classList.remove("hidden");
}

function closeIllerXercDropdown1() {
    document.getElementById("illerXercDropdown1").classList.add("hidden");
    
    // DÜZƏLİŞ: ID-ni HTML-dəki kimi 'searchillerXerc' olaraq dəyişin
    const searchInput = document.getElementById("searchillerXerc"); 
    
    if (searchInput) {
        searchInput.value = ''; // İndi 'null' üzərində işləməyəcək
    }

    document.querySelectorAll("#illerXercList label").forEach(label => {
        const text = label.textContent.toLowerCase();
        label.style.display = "flex"
    });
}

function clearIllerXercFilters() {
    document.querySelectorAll("#illerXercList input[type='checkbox']").forEach(cb => cb.checked = false);
}

function applyIllerXercFilters() {
    const selected = Array.from(document.querySelectorAll("#illerXercList input:checked"))
        .map(cb => cb.value);
    closeIllerXercDropdown1();
}

function filterIllerXercList() {
    const search = document.getElementById("searchillerXerc").value.toLowerCase();
    document.querySelectorAll("#illerXercList label").forEach(label => {
        const text = label.textContent.toLowerCase();
        label.style.display = text.includes(search) ? "flex" : "none";
    });
}
function openSirketlerXercDropdown1() {
    document.getElementById("sirketlerXercDropdown1").classList.remove("hidden");
}

function closeSirketlerXercDropdown1() {
    document.getElementById("sirketlerXercDropdown1").classList.add("hidden");
    document.getElementById("searchSirketlerXerc").value = '';
    document.querySelectorAll("#sirketlerXercList label").forEach(label => {

        label.style.display = "flex"
    });

}

function clearSirketlerXercFilters() {
    document.querySelectorAll("#sirketlerXercList input[type='checkbox']").forEach(cb => cb.checked = false);
}


function applySirketlerXercFilters() {
    const selected = Array.from(document.querySelectorAll("#sirketlerXercList input:checked"))
        .map(cb => cb.value);
    closeSirketlerXercDropdown1();
}

function filterSirketlerXercList() {
    const search = document.getElementById("searchSirketlerXerc").value.toLowerCase();
    document.querySelectorAll("#sirketlerXercList label").forEach(label => {
        const text = label.textContent.toLowerCase();
        label.style.display = text.includes(search) ? "flex" : "none";
    });
}

function openİmtiyazlarDropdown1() {
    document.getElementById("imtiyazlarXercDropdown1").classList.remove("hidden");
}

function closeİmtiyazlarDropdown1() {
    document.getElementById("imtiyazlarXercDropdown1").classList.add("hidden");
    document.getElementById("searchİmtiyazlar").value = '';
    document.querySelectorAll("#imtiyazlarXercList label").forEach(label => {

        label.style.display = "flex"
    });
}

function clearİmtiyazlarFilters() {
    document.querySelectorAll("#imtiyazlarXercList input[type='checkbox']").forEach(cb => cb.checked = false);

}

function applyİmtiyazlarFilters() {
    const selected = Array.from(document.querySelectorAll("#imtiyazlarXercList input:checked"))
        .map(cb => cb.value);
    closeİmtiyazlarDropdown1();
}

function filterİmtiyazlarList() {
    const search = document.getElementById("searchİmtiyazlar").value.toLowerCase();
    document.querySelectorAll("#imtiyazlarXercList label").forEach(label => {
        const text = label.textContent.toLowerCase();
        label.style.display = text.includes(search) ? "flex" : "none";
    });
}

function openXerclemeDropdown1() {
    document.getElementById("xerclemeDropdown1").classList.remove("hidden");
}

function closeXerclemeDropdown1() {
    document.getElementById("xerclemeDropdown1").classList.add("hidden");
    document.getElementById("searchXercleme").value = '';
    document.querySelectorAll("#xerclemeList label").forEach(label => {

        label.style.display = "flex"
    });

}

function clearXerclemeFilters() {
    document.querySelectorAll("#xerclemeList input[type='checkbox']").forEach(cb => cb.checked = false);
}

function applyXerclemeFilters() {
    const selected = Array.from(document.querySelectorAll("#xerclemeList input:checked"))
        .map(cb => cb.value);
    closeXerclemeDropdown1();
}

function filterXerclemeList() {
    const search = document.getElementById("searchXercleme").value.toLowerCase();
    document.querySelectorAll("#xerclemeList label").forEach(label => {
        const text = label.textContent.toLowerCase();
        label.style.display = text.includes(search) ? "flex" : "none";
    });
}
