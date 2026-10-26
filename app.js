const activities = [
  { name: "Football match", icon: "⚽", color: "#eff3e9", description: "Kick it around" },
  { name: "Picnic", icon: "🧺", color: "#fbf1df", description: "A little fresh air" },
  { name: "Coffee & catch-up", icon: "☕", color: "#f4ece7", description: "Good talks, great coffee" },
  { name: "Dinner out", icon: "🍽️", color: "#f4edf2", description: "Save a seat" },
  { name: "Movie night", icon: "🎬", color: "#eaf0f5", description: "Pick a film" },
  { name: "Hiking", icon: "🥾", color: "#edf1e8", description: "Take the scenic route" },
  { name: "Game night", icon: "🎲", color: "#f4eee4", description: "Friendly competition" },
  { name: "Beach day", icon: "🏖️", color: "#e9f2f2", description: "Sun, sand & friends" },
  { name: "Live music", icon: "🎸", color: "#f2ebf2", description: "Find your rhythm" },
  { name: "Friends hangout", icon: "🫶", color: "#f8ece9", description: "Just because" },
];

const avatarColors = [
  ["#f4e8dc", "#805d44"], ["#e7e3f0", "#675d82"], ["#e0ebdf", "#4d704e"],
  ["#f2e4e4", "#8b5d5d"], ["#e4eaf2", "#586b84"], ["#eee9d9", "#7d7046"],
  ["#e8e2ed", "#705c7e"], ["#e5ece6", "#52725d"], ["#f1e7dc", "#8b694c"],
  ["#e0ebed", "#4f727a"],
];

const activityGrid = document.querySelector("#activity-grid");
const friendGrid = document.querySelector("#friend-grid");
const friendSearch = document.querySelector("#friend-search");
const activeFilter = document.querySelector("#active-filter");
const friendDialog = document.querySelector("#friend-dialog");
const friendForm = document.querySelector("#friend-form");
const toast = document.querySelector("#toast");
let selectedActivity = activities[0].name;
let friends = [];
let databaseReady = false;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

async function apiRequest(method = "GET", id, data) {
  const url = new URL("api.php", window.location.href);
  url.searchParams.set("resource", "friends");
  if (id) url.searchParams.set("id", id);

  let response;
  try {
    response = await fetch(url, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
    });
  } catch {
    throw new Error("Cannot reach the Hangout database. Open this app through Laragon at http://localhost/Hangout/ and check that MySQL is running.");
  }

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error("The server returned an unreadable response. Make sure PHP is enabled in Laragon.");
  }

  if (!response.ok) {
    throw new Error(result.error || `The request failed (${response.status}).`);
  }

  return result;
}

function setDatabaseStatus(message, state) {
  const status = document.querySelector("#database-status");
  status.textContent = message;
  status.dataset.state = state;
  databaseReady = state === "connected";
  document.querySelector("#add-friend-button").disabled = !databaseReady;
}

function renderActivities() {
  activityGrid.innerHTML = activities.map((activity) => `
    <button class="activity-card${selectedActivity === activity.name ? " selected" : ""}"
      type="button" data-activity="${escapeHtml(activity.name)}"
      aria-pressed="${selectedActivity === activity.name}" style="--icon-bg:${activity.color}">
      <span class="activity-icon" aria-hidden="true">${activity.icon}</span>
      <span class="activity-copy"><strong>${escapeHtml(activity.name)}</strong><small>${escapeHtml(activity.description)}</small></span>
      <span class="activity-check" aria-hidden="true">✓</span>
    </button>`).join("");
}

function initials(name) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toUpperCase();
}

function renderFriend(friend, index) {
  const [background, foreground] = avatarColors[index % avatarColors.length];
  const budgetClass = friend.budget.toLowerCase().replace(/\s+/g, "-");
  const tags = friend.activities.map((activity) => `<span class="friend-tag">${escapeHtml(activity)}</span>`).join("");

  return `
    <article class="friend-card">
      <div class="friend-card-top">
        <div class="friend-avatar" style="--avatar-bg:${background};--avatar-ink:${foreground}" aria-hidden="true">${escapeHtml(initials(friend.name))}</div>
        <div class="friend-identity"><h3>${escapeHtml(friend.name)}</h3><p class="friend-role">${escapeHtml(friend.role || "Friend")}</p></div>
        <div class="friend-actions">
          <button class="icon-button edit-friend" type="button" data-id="${escapeHtml(friend.id)}" aria-label="Edit ${escapeHtml(friend.name)}" title="Edit friend">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 5 5 5M4 20l4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z"/></svg>
          </button>
          <button class="icon-button delete delete-friend" type="button" data-id="${escapeHtml(friend.id)}" aria-label="Delete ${escapeHtml(friend.name)}" title="Delete friend">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6m4-6v6M5.5 7l1 13h11l1-13M9 7V4h6v3"/></svg>
          </button>
        </div>
      </div>
      <div class="friend-details">
        <div class="detail-row"><span class="detail-icon" aria-hidden="true">↗</span><a href="tel:${escapeHtml(friend.phone.replace(/[^\d+]/g, ""))}">${escapeHtml(friend.phone)}</a><span class="budget-pill ${escapeHtml(budgetClass)}">${escapeHtml(friend.budget)}</span></div>
        <div class="detail-row"><span class="detail-icon" aria-hidden="true">◷</span><span class="availability-value">${escapeHtml(friend.availability || "Ask them when they're free")}</span></div>
      </div>
      <div class="tag-list">${tags}</div>
    </article>`;
}

function renderFriends() {
  const query = friendSearch.value.trim().toLocaleLowerCase();
  const matching = friends.filter((friend) => friend.activities.includes(selectedActivity)
    && friend.name.toLocaleLowerCase().includes(query));

  friendGrid.innerHTML = matching.map(renderFriend).join("");
  friendGrid.hidden = !databaseReady || matching.length === 0;
  document.querySelector("#empty-state").hidden = !databaseReady || matching.length !== 0;
  document.querySelector("#friend-count").textContent = databaseReady
    ? `${matching.length} ${matching.length === 1 ? "friend" : "friends"}`
    : "Connecting…";
  document.querySelector("#sidebar-friend-count").textContent = friends.length;
  document.querySelector("#stack-more").textContent = `+${Math.max(0, friends.length - 3)}`;
  document.querySelector("#friends-title").textContent = selectedActivity === "Friends hangout"
    ? "Your friends" : "Friends up for it";
  activeFilter.innerHTML = `Showing friends into <strong>${escapeHtml(selectedActivity)}</strong>${query ? ` matching <strong>“${escapeHtml(friendSearch.value.trim())}”</strong>` : ""}`;
}

function render() {
  renderActivities();
  renderFriends();
}

function openFriendDialog(friend) {
  friendForm.reset();
  document.querySelector("#friend-id").value = friend?.id || "";
  document.querySelector("#dialog-title").textContent = friend ? "Edit friend" : "Add a friend";
  document.querySelector("#save-friend-button").textContent = friend ? "Save changes" : "Add friend";
  document.querySelector("#friend-name").value = friend?.name || "";
  document.querySelector("#friend-phone").value = friend?.phone || "";
  document.querySelector("#friend-role").value = friend?.role || "";
  document.querySelector("#friend-availability").value = friend?.availability || "";
  document.querySelector("#friend-budget").value = friend?.budget || "Budget-friendly";
  document.querySelector("#friend-activities").value = friend?.activities.join(", ") || selectedActivity;
  friendDialog.showModal();
  document.querySelector("#friend-name").focus();
}

let toastTimeout;
function showToast(message) {
  window.clearTimeout(toastTimeout);
  toast.textContent = message;
  toast.classList.add("visible");
  toastTimeout = window.setTimeout(() => toast.classList.remove("visible"), 2600);
}

activityGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-activity]");
  if (!button) return;
  selectedActivity = button.dataset.activity;
  render();
});

friendSearch.addEventListener("input", renderFriends);
document.querySelector("#add-friend-button").addEventListener("click", () => openFriendDialog());
document.querySelector("#dialog-close").addEventListener("click", () => friendDialog.close());
document.querySelector("#dialog-cancel").addEventListener("click", () => friendDialog.close());

friendGrid.addEventListener("click", (event) => {
  const editButton = event.target.closest(".edit-friend");
  if (editButton) {
    const friend = friends.find((entry) => entry.id === editButton.dataset.id);
    if (friend) openFriendDialog(friend);
    return;
  }

  const deleteButton = event.target.closest(".delete-friend");
  if (!deleteButton) return;
  const friend = friends.find((entry) => entry.id === deleteButton.dataset.id);
  if (!friend || !window.confirm(`Remove ${friend.name} from your circle?`)) return;
  deleteButton.disabled = true;
  apiRequest("DELETE", friend.id).then(() => {
    friends = friends.filter((entry) => entry.id !== friend.id);
    renderFriends();
    showToast(`${friend.name} was removed.`);
  }).catch((error) => {
    deleteButton.disabled = false;
    showToast(error.message);
  });
});

friendForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!friendForm.reportValidity()) return;

  const id = document.querySelector("#friend-id").value;
  const friend = {
    id: id || `friend-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: document.querySelector("#friend-name").value.trim(),
    phone: document.querySelector("#friend-phone").value.trim(),
    role: document.querySelector("#friend-role").value.trim(),
    availability: document.querySelector("#friend-availability").value.trim(),
    budget: document.querySelector("#friend-budget").value,
    activities: [...new Set(document.querySelector("#friend-activities").value.split(",").map((activity) => activity.trim()).filter(Boolean))],
  };

  if (!friend.activities.length) {
    document.querySelector("#friend-activities").setCustomValidity("Add at least one activity.");
    document.querySelector("#friend-activities").reportValidity();
    return;
  }
  document.querySelector("#friend-activities").setCustomValidity("");

  const saveButton = document.querySelector("#save-friend-button");
  saveButton.disabled = true;
  apiRequest(id ? "PUT" : "POST", id, friend).then((savedFriend) => {
    if (id) {
      friends = friends.map((entry) => entry.id === id ? savedFriend : entry);
    } else {
      friends.push(savedFriend);
    }
    friendDialog.close();
    renderFriends();
    showToast(id ? "Friend details saved to your database." : "Friend added to your database.");
  }).catch((error) => {
    showToast(error.message);
  }).finally(() => {
    saveButton.disabled = false;
  });
});

document.querySelector("#friend-activities").addEventListener("input", (event) => event.target.setCustomValidity(""));
document.querySelector("#today-label").textContent = new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" }).format(new Date());
document.addEventListener("keydown", (event) => {
  if (event.key === "/" && !friendDialog.open && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) {
    event.preventDefault();
    friendSearch.focus();
  }
});

render();
setDatabaseStatus("Connecting to your Hangout database…", "connecting");
apiRequest().then((storedFriends) => {
  if (!Array.isArray(storedFriends)) {
    throw new Error("The server returned an invalid friends list.");
  }
  friends = storedFriends;
  setDatabaseStatus(`Connected to the Hangout database · ${friends.length} friends saved`, "connected");
  renderFriends();
}).catch((error) => {
  setDatabaseStatus(error.message, "error");
  renderFriends();
});
