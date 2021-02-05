import { Writable } from "svelte/store";
import { braid_fetch, braid_put } from "./braid-client";

export class ArrayResource<T> {
  version: number;
  url: URL;
  store: Writable<Array<T>>;

  constructor(url: URL, store: Writable<Array<T>>) {
    this.version = 0;
    this.url = url;
    this.store = store;

    braid_fetch(url, { subscribe: { keep_alive: true } }, (response) => {
      this.version = response.version;

      // When we receive updates, they might come in the form of patches:
      if (response.patches) {
        this.applyPatches(response.patches);
      } else {
        this.setRaw(response.body);
      }
    });
  }

  setRaw(jsonValue: string) {
    this.store.set(JSON.parse(jsonValue));
  }

  push(value: any) {
    this.store.update(($value: Array<T>) => {
      return [...$value, value];
    });
  }

  applyPatches(patches) {
    // There are only two types of patches we could receive
    for (var patch of patches) {
      if (patch.range === "") {
        // The entire chat in one patch
        this.setRaw(patch.value);
      } else {
        this.push(JSON.parse(patch.value));
      }
    }
  }

  async append(value: any) {
    var patches = [{ range: "json=[-0:-0]", value: JSON.stringify(value) }];
    var res = await braid_put(this.url, { patches });
    if (res.status === 200) console.debug("braid_put complete");
    else console.debug("braid_put failed with", res.status);
  }
}
