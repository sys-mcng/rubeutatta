// タブ切り替え
document.querySelectorAll(".nav-tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetId = btn.dataset.tab;

    document.querySelectorAll(".nav-tab").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    document.querySelectorAll(".tab-panel").forEach((panel) => {
      panel.classList.toggle("active", panel.id === targetId);
    });
  });
});

const songsTbody = document.getElementById("songs-tbody");
const resultCountEl = document.getElementById("result-count");
const keywordInput = document.getElementById("keyword-input");
const dateFromInput = document.getElementById("date-from");
const dateToInput = document.getElementById("date-to");
const clearFiltersBtn = document.getElementById("clear-filters");
const tagFiltersContainer = document.getElementById("tag-filters");

let allSongs = [];
let activeTags = new Set();

// JSON読み込み
fetch("songs.json")
  .then((res) => res.json())
  .then((data) => {
    allSongs = data.songs || [];
    buildTagFilters(allSongs);
    renderSongs(allSongs);
  })
  .catch((err) => {
    console.error("songs.json の読み込みに失敗しました", err);
  });

// タグフィルタボタン生成
function buildTagFilters(songs) {
  const tagSet = new Set();
  songs.forEach((song) => {
    (song.tags || []).forEach((t) => tagSet.add(t));
  });

  const tags = Array.from(tagSet).sort();
  tags.forEach((tag) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = tag;
    btn.className = "tag-filter-btn";
    btn.dataset.tag = tag;

    btn.addEventListener("click", () => {
      if (activeTags.has(tag)) {
        activeTags.delete(tag);
        btn.classList.remove("active");
      } else {
        activeTags.add(tag);
        btn.classList.add("active");
      }
      applyFilters();
    });

    tagFiltersContainer.appendChild(btn);
  });
}

// テーブル描画
function renderSongs(songs) {
  songsTbody.innerHTML = "";

  songs.forEach((song) => {
    const tr = document.createElement("tr");

    const tdTitle = document.createElement("td");
    tdTitle.textContent = song.title || "";
    tr.appendChild(tdTitle);

    const tdArtist = document.createElement("td");
    tdArtist.textContent = song.artist || "";
    tr.appendChild(tdArtist);

    const tdDate = document.createElement("td");
    tdDate.textContent = song.date || "";
    tr.appendChild(tdDate);

    const tdCollab = document.createElement("td");
    tdCollab.textContent = song.collab || "";
    tr.appendChild(tdCollab);

    const tdTags = document.createElement("td");
    (song.tags || []).forEach((tag) => {
      const span = document.createElement("span");
      span.className = "tag-badge";
      span.textContent = tag;
      tdTags.appendChild(span);
    });
    tr.appendChild(tdTags);

    const tdLink = document.createElement("td");
    if (song.videoUrl) {
      const a = document.createElement("a");
      a.href = song.videoUrl;
      a.target = "_blank";
      a.rel = "noopener";
      a.className = "link-button";
      a.textContent = "見る";
      tdLink.appendChild(a);
    } else {
      tdLink.textContent = "-";
    }
    tr.appendChild(tdLink);

    songsTbody.appendChild(tr);
  });

  resultCountEl.textContent = `表示件数：${songs.length} 件`;
}

// フィルタ適用
function applyFilters() {
  const keyword = keywordInput.value.trim().toLowerCase();
  const from = dateFromInput.value ? new Date(dateFromInput.value) : null;
  const to = dateToInput.value ? new Date(dateToInput.value) : null;

  const filtered = allSongs.filter((song) => {
    // キーワード
    if (keyword) {
      const targetText = [
        song.title,
        song.artist,
        song.collab,
        (song.tags || []).join(" "),
      ]
        .join(" ")
        .toLowerCase();

      if (!targetText.includes(keyword)) return false;
    }

    // 日付
    if (from || to) {
      if (!song.date) return false;
      const d = new Date(song.date);
      if (from && d < from) return false;
      if (to && d > to) return false;
    }

    // タグ
    if (activeTags.size > 0) {
      const songTags = new Set(song.tags || []);
      for (const t of activeTags) {
        if (!songTags.has(t)) return false;
      }
    }

    return true;
  });

  renderSongs(filtered);
}

// イベント設定
keywordInput.addEventListener("input", () => {
  applyFilters();
});

dateFromInput.addEventListener("change", () => {
  applyFilters();
});

dateToInput.addEventListener("change", () => {
  applyFilters();
});

clearFiltersBtn.addEventListener("click", () => {
  keywordInput.value = "";
  dateFromInput.value = "";
  dateToInput.value = "";
  activeTags.clear();
  document.querySelectorAll(".tag-filter-btn").forEach((btn) => btn.classList.remove("active"));
  renderSongs(allSongs);
});
