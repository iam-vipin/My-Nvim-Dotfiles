// assets
import SomethingWentWrongImage from "@/app/assets/something-went-wrong.svg?url";

export function PageDetailsError() {
  return (
    <div className="h-screen w-screen grid place-items-center p-6">
      <div className="text-center">
        <div className="mx-auto grid h-52 w-52 place-items-center rounded-full bg-layer-1">
          <div className="grid h-32 w-32 place-items-center">
            <img src={SomethingWentWrongImage} alt="Oops! Something went wrong" />
          </div>
        </div>
        <h1 className="mt-12 text-28 font-semibold">Oops! Something went wrong.</h1>
        <p className="mt-4 text-custom-text-300">The page does not exist. Please check the URL.</p>
      </div>
    </div>
  );
}
