import { LoaderCircleIcon, TrashIcon, XIcon } from "lucide-react";

import {
  FileIcon,
  FileList,
  FileName,
  FileUpload,
  FileUploader,
  useFileUploader,
} from "#/components/file-upload";
import type { UploadedFile } from "#/components/file-upload";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useSelector } from "@tanstack/react-form";
import { useEffect } from "react";

import { categoryByIdOptions } from "../products.queries";
import { categorySchema } from "../products.schema";
import type { CategorySchema } from "../products.schema";
import { saveCategoryFn } from "../server/functions/categories";

import { toast } from "#/components/ui/toast";
import { Button } from "#/components/ui/button";
import { AdminPageWrapper } from "#/components/admin-page-wrapper";
import { useAppForm, useFormContext } from "#/components/form/hooks";
import { FormNavigationBlocker } from "#/components/form-navigation-blocker";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";

import { slugify } from "#/lib/slugify";

export function CategoryForm(props: {
  id?: number;
  defaultValues?: CategorySchema;
  image?: UploadedFile;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const saveCategory = useServerFn(saveCategoryFn);

  const saveCategoryMutation = useMutation({
    mutationFn: saveCategory,
    onSuccess: async (response) => {
      if (response.status === "SUCCESS") {
        toast.add({
          type: "success",
          description: response.message,
        });

        if (!props.id) {
          navigate({
            to: "/admin/product-categories",
          });
        } else {
          await queryClient.invalidateQueries(
            categoryByIdOptions({ id: props.id }),
          );
        }
      } else {
        toast.add({
          type: "error",
          description: response.message,
        });
      }
    },
  });

  const form = useAppForm({
    defaultValues:
      props.defaultValues ??
      ({
        name: "",
        slug: "",
        imageId: undefined as unknown as number,
      } satisfies CategorySchema),
    validators: {
      onChange: categorySchema,
    },
    onSubmit: async ({ value }) => {
      await saveCategoryMutation.mutateAsync({
        data: {
          values: value,
          id: props.id,
        },
      });
    },
  });

  const nameValue = useSelector(form.store, (state) => state.values.name);

  useEffect(() => {
    form.setFieldValue("slug", slugify(nameValue));
  }, [form, nameValue]);

  const pageTitle = props.id
    ? `Edit ${props.defaultValues?.name} Category`
    : "Add New Category";

  return (
    <form.AppForm>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <FormNavigationBlocker />

        <AdminPageWrapper
          breadcrumbs={[
            {
              label: "All Categories",
              href: "/admin/product-categories",
            },
          ]}
          pageTitle={pageTitle}
          rightSideContent={<ActionButtons isEditing={!!props.id} />}
        >
          <Card className="container px-0">
            <CardHeader>
              <CardTitle>
                {props.id ? "Edit Category" : "Add Category"}
              </CardTitle>
              <CardDescription>
                {props.id
                  ? "Update the category name and slug."
                  : "Add a new category by entering a suitable name and slug."}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form.FormGroup className="mb-6">
                <form.AppField
                  name="imageId"
                  children={(field) => (
                    <field.FormField>
                      <field.FormLabel>Category Image</field.FormLabel>

                      <FileUploader
                        maxFilesCount={1}
                        maxFileSize="1gb"
                        accept={["image/*"]}
                        onChange={(files) => field.handleChange(files[0]?.id)}
                        initialFiles={props.image ? [props.image] : []}
                      >
                        <FileUpload />
                        <UploadingFilesList />
                        <UploadedFilesList />
                      </FileUploader>

                      <field.FormError />
                      <field.FormDescription>
                        Upload an image that represents this category.
                      </field.FormDescription>
                    </field.FormField>
                  )}
                />
              </form.FormGroup>
              <form.FormGroup className="grid items-start gap-6 md:grid-cols-2">
                <form.AppField
                  name="name"
                  children={(field) => (
                    <field.FormField>
                      <field.FormLabel>Name</field.FormLabel>
                      <field.FormInput
                        type="text"
                        placeholder="Fresh Vegetables"
                      />
                      <field.FormError />
                      <field.FormDescription>
                        Enter a suitable category name.
                      </field.FormDescription>
                    </field.FormField>
                  )}
                />

                <form.AppField
                  name="slug"
                  children={(field) => (
                    <field.FormField>
                      <field.FormLabel>Slug</field.FormLabel>
                      <field.FormInput
                        type="text"
                        placeholder="fresh-vegetables"
                      />
                      <field.FormError />
                      <field.FormDescription>
                        This will be used in the URL of the category.
                      </field.FormDescription>
                    </field.FormField>
                  )}
                />
              </form.FormGroup>
            </CardContent>
          </Card>
          <div className="grid gap-2 xs:grid-cols-2 md:hidden">
            <ActionButtons isEditing={!!props.id} />
          </div>
        </AdminPageWrapper>
      </form>
    </form.AppForm>
  );
}

function ActionButtons({ isEditing }: { isEditing?: boolean }) {
  const {
    state: { isSubmitting },
  } = useFormContext();

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        type="button"
        nativeButton={false}
        render={<Link to="/admin/product-categories">Discard</Link>}
      />

      <Button size="sm" type="submit" disabled={isSubmitting}>
        {isSubmitting && <LoaderCircleIcon className="animate-spin" />}
        <span>{isEditing ? "Update" : "Add"} Category</span>
      </Button>
    </>
  );
}

function UploadingFilesList() {
  const { uploadingFiles, cancelUpload } = useFileUploader();

  if (uploadingFiles.length === 0) return null;

  return (
    <div className="mt-4">
      <p>Uploading file</p>

      <div className="mt-2 space-y-2">
        {uploadingFiles.map(({ file, preview, progress }) => (
          <FileList key={file.name}>
            <FileIcon fileType={file.type} name={file.name} preview={preview} />

            <FileName name={file.name} progress={progress} />

            <Button
              onClick={() => cancelUpload(file)}
              size="icon"
              variant="destructive"
              type="button"
              className="justify-self-end"
            >
              <XIcon />
            </Button>
          </FileList>
        ))}
      </div>
    </div>
  );
}

function UploadedFilesList() {
  const { uploadedFiles, deleteFile } = useFileUploader();

  if (uploadedFiles.length === 0) return null;

  return (
    <div className="mt-4">
      <p>Uploaded file</p>

      <div className="mt-2 space-y-2">
        {uploadedFiles.map(({ name, url, fileType, id }) => (
          <FileList key={id} className="grow">
            <FileIcon fileType={fileType} name={name} preview={url} />

            <FileName name={name} />

            <Button
              onClick={() => deleteFile(url)}
              size="icon"
              variant="destructive"
              type="button"
              className="justify-self-end"
            >
              <TrashIcon />
            </Button>
          </FileList>
        ))}
      </div>
    </div>
  );
}
