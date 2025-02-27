import { Form } from "react-router";

type AlbumFormProps = {
  defaultValues?: {
    title?: string;
    artist?: string;
    year?: string | number;
    runningTime?: string | number;
    tracks?: string | string[];
  };
  errors?: {
    title?: { message: string };
    artist?: { message: string };
    year?: { message: string };
    runningTime?: { message: string };
    tracks?: { message: string };
  };
  submitLabel?: string;
};

export default function AlbumForm({
  defaultValues = {},
  errors = {},
  submitLabel = "Save",
}: AlbumFormProps) {
  // Convert tracks array to string if needed
  const tracksValue = Array.isArray(defaultValues.tracks)
    ? defaultValues.tracks.join("\n")
    : defaultValues.tracks;

  return (
    <Form method="post">
      <label htmlFor="title" className="mb-1 block font-semibold">
        Title:
      </label>
      <input
        type="text"
        name="title"
        id="title"
        placeholder="Title"
        defaultValue={defaultValues.title}
        className={[
          "rounded border border-orange-200 p-2 w-full",
          errors.title ? "border-2 border-red-500" : "",
        ].join(" ")}
      />
      {errors.title && (
        <p className="mb-0 mt-1 text-red-500">{errors.title.message}</p>
      )}

      <label htmlFor="artist" className="mb-1 block font-semibold">
        Artist:
      </label>
      <input
        type="text"
        name="artist"
        id="artist"
        placeholder="Artist"
        defaultValue={defaultValues.artist}
        className={[
          "rounded border border-orange-200 p-2 w-full",
          errors.artist ? "border-2 border-red-500" : "",
        ].join(" ")}
      />
      {errors.artist && (
        <p className="mb-0 mt-1 text-red-500">{errors.artist.message}</p>
      )}

      <label htmlFor="year" className="mb-1 block font-semibold">
        Year:
      </label>
      <input
        type="text"
        name="year"
        id="year"
        placeholder="Year"
        defaultValue={defaultValues.year}
        className={[
          "rounded border border-orange-200 p-2 w-full",
          errors.year ? "border-2 border-red-500" : "",
        ].join(" ")}
      />
      {errors.year && (
        <p className="mb-0 mt-1 text-red-500">{errors.year.message}</p>
      )}

      <label htmlFor="runningTime" className="mb-1 block font-semibold">
        Running Time:
      </label>
      <input
        type="text"
        name="runningTime"
        id="runningTime"
        placeholder="Running time (in minutes)"
        defaultValue={defaultValues.runningTime}
        className={[
          "rounded border border-orange-200 p-2 w-full",
          errors.runningTime ? "border-2 border-red-500" : "",
        ].join(" ")}
      />
      {errors.runningTime && (
        <p className="mb-0 mt-1 text-red-500">{errors.runningTime.message}</p>
      )}

      <label htmlFor="tracks" className="mb-1 block font-semibold">
        Tracks:
      </label>
      <textarea
        name="tracks"
        id="tracks"
        rows={10}
        placeholder="Tracks (one per line)"
        defaultValue={tracksValue}
        className={[
          "rounded border border-orange-200 p-2 w-full",
          errors.tracks ? "border-2 border-red-500" : "",
        ].join(" ")}
      ></textarea>
      {errors.tracks && (
        <p className="mb-0 mt-1 text-red-500">{errors.tracks.message}</p>
      )}

      <br />
      <button
        type="submit"
        className="mt-3 rounded bg-orange-600 p-2 text-white transition-colors hover:bg-orange-700"
      >
        {submitLabel}
      </button>
    </Form>
  );
}
