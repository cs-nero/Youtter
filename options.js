function saveOptions(e) {
  e.preventDefault();
  let instance = document.querySelector("#instance").value.trim();
  instance = instance.replace(/^https?:?\/?\/?/, '').replace('\/$');
  if (!instance) {
    return alert('Please insert an instance!');
  }
  browser.storage.sync.set({
    instance: instance,
  }).then(() => alert('Saved!'));
}

function restoreOptions() {

  function setCurrentChoice(result) {
    document.querySelector("#instance").value = result.instance;
  }
browser.storage.sync.get("instance", (result) => {
  instance = result.instance || "yotter.xyz";
});

}
	
document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);