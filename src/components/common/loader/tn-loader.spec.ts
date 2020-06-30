import { bootstrap } from "aurelia-bootstrapper";
import { ComponentTester, StageComponent } from "aurelia-testing";

const createComponent = async (markup: string, vm: object = {}): Promise<ComponentTester> => {
  const component = StageComponent.withResources(["components/common/loader/tn-loader"])
    .inView(markup)
    .boundTo(vm);
  await component.create(bootstrap);
  return component;
};

describe("tn-loader component", () => {
  let component: ComponentTester;

  it("should by default not render", async () => {
    component = await createComponent("<tn-loader></tn-loader>");

    const loaderElement = document.querySelector(".tn-loader");
    expect(loaderElement).toBe(null);
  });

  it("should render if loading is true", async () => {
    component = await createComponent(`<tn-loader loading.bind="isLoading"></tn-loader>`, {
      isLoading: true,
    });

    const loaderElement = document.querySelector(".tn-loader");
    expect(loaderElement).not.toBe(null);
  });

  describe("props", () => {
    it("should add class 'tn-loader--contain' after adding prop contain", async () => {
      component = await createComponent(
        `<tn-loader contain loading.bind="isLoading"></tn-loader>`,
        { isLoading: true },
      );

      const loaderElement = document.querySelector(".tn-loader");
      expect(loaderElement.className).toContain("tn-loader--contain");
    });
  });

  afterEach(() => {
    component.dispose();
  });
});
