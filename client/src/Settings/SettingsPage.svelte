<script>
  import { get } from "svelte/store";
  import Select from "svelte-select";

  import NotificationSetting from "../Notifications/NotificationSetting.svelte";
  import { author } from "../config";
  import { sanitize } from "../utils/sanitize";

  export let authors;

  let items;
  let selectedValue;

  $: {
    items = [...$authors.map((a) => a.shortname)].map((shortname) => ({
      value: shortname,
      label: shortname,
    }));
  }

  $: selectedValue = { value: $author, label: $author };

  function maybeCreateAuthor(shortname) {
    const found = get(authors).find((author) => author.shortname === shortname);
    if (shortname && !found) {
      authors.append({ shortname });
    }
  }

  function handleSelect({ detail }) {
    const shortname = sanitize(detail.value);
    maybeCreateAuthor(shortname);
    selectedValue = shortname;
    $author = shortname;
  }
</script>

<page>
  <h1>Settings</h1>
  <setting>
    <label for="author">Author Shortname</label>
    <Select
      isCreatable={true}
      {items}
      {selectedValue}
      containerClasses="settings-select"
      on:select={handleSelect}
    />
    <info>Note: You can type to Create an author.</info>
  </setting>
  <setting>
    <label for="notifications">Notifications</label>
    <info><NotificationSetting /></info>
  </setting>
</page>

<style>
  page {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  h1 {
    color: white;
  }

  setting {
    display: flex;
    flex-direction: column;
    width: 400px;
  }

  info {
    margin-top: 8px;
    color: var(--white);
  }

  info a {
    color: var(--cherry);
    text-shadow: 0px 0px 4px black;
  }

  :global(.settings-select) {
    width: 150px;
  }

  label {
    font-size: 24px;
    color: white;
    margin-top: 24px;
  }
</style>
