import { LoaderCircleIcon, TrashIcon, XIcon } from "lucide-react";

import { useEffect } from "react";

import { useSelector } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { productByIdOptions } from "../products.queries";
import { productSchema } from "../products.schema";
import type { ProductSchema, ProductSchemaInput } from "../products.schema";
import { saveProductFn } from "../server/functions/products";

import { AdminPageWrapper } from "#/components/admin-page-wrapper";
import {
  FileIcon,
  FileList,
  FileName,
  FileUpload,
  FileUploader,
  useFileUploader,
} from "#/components/file-upload";
import type { UploadedFile } from "#/components/file-upload";
import { FormNavigationBlocker } from "#/components/form-navigation-blocker";
import { useAppForm, useFormContext } from "#/components/form/hooks";
import { Button } from "#/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
// import { InputWithStartIcon } from "#/components/ui/input-with-start-icon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from "#/components/ui/select";
import { toast } from "#/components/ui/toast";

import { slugify } from "#/lib/slugify";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "#/components/ui/input-group";

export function ProductForm(props: {
  id?: number;
  categories: { id: number; name: string }[];
  images?: UploadedFile[];
  defaultValues?: ProductSchema;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const saveProduct = useServerFn(saveProductFn);

  const saveProductMutation = useMutation({
    mutationFn: saveProduct,
    onSuccess: async (response) => {
      if (response.status === "SUCCESS") {
        toast.add({
          type: "success",
          description: response.message,
        });

        if (!props.id) {
          navigate({
            to: "/admin/products",
          });
        } else {
          await queryClient.invalidateQueries(
            productByIdOptions({ id: props.id }),
          );
        }
      } else {
        toast.add({
          type: "error",
          description: response.message,
        });
      }
    },
    onError: (error) => {
      toast.add({
        type: "error",
        description: error.message,
      });
    },
  });

  const form = useAppForm({
    defaultValues:
      props.defaultValues ??
      ({
        name: "",
        slug: "",
        description: "",
        images: [],
        price: "",
        unit: "",
        status: "draft",
        categoryId: null,
      } satisfies ProductSchemaInput),
    validators: {
      onChange: productSchema,
    },
    onSubmit: async ({ value }) => {
      await saveProductMutation.mutateAsync({
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
    ? `Edit ${props.defaultValues?.name} Product`
    : "Add New Product";

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
              label: "All Products",
              href: "/admin/products",
            },
          ]}
          pageTitle={pageTitle}
          rightSideContent={<ActionButtons isEditing={!!props.id} />}
        >
          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
              <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
                <Card className="container px-0">
                  <CardHeader>
                    <CardTitle className="text-xl">Product Details</CardTitle>
                    <CardDescription>
                      Add a new product by entering suitable name, slug,
                      description, category, price, and so on.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="grid gap-6">
                    <form.AppField
                      name="name"
                      children={(field) => (
                        <field.FormField>
                          <field.FormLabel>Name</field.FormLabel>
                          <field.FormInput type="text" placeholder="Carrot" />
                          <field.FormError />
                          <field.FormDescription>
                            Enter a suitable name for the product.
                          </field.FormDescription>
                        </field.FormField>
                      )}
                    />

                    <form.AppField
                      name="slug"
                      children={(field) => (
                        <field.FormField>
                          <field.FormLabel>Slug</field.FormLabel>
                          <field.FormInput type="text" placeholder="carrot" />
                          <field.FormError />
                          <field.FormDescription>
                            This will be used in the URL of the product.
                          </field.FormDescription>
                        </field.FormField>
                      )}
                    />

                    <div className="grid items-start gap-4 lg:grid-cols-2">
                      <form.AppField
                        name="price"
                        children={(field) => (
                          <field.FormField>
                            <field.FormLabel>Price</field.FormLabel>

                            {/* <InputWithStartIcon
                              type="text"
                              placeholder="199"
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                            >
                              Rs.
                            </InputWithStartIcon> */}
                            <InputGroup>
                              <InputGroupInput
                                type="text"
                                placeholder="199"
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) =>
                                  field.handleChange(e.target.value)
                                }
                              />
                              <InputGroupAddon>Rs.</InputGroupAddon>
                            </InputGroup>

                            <field.FormError />
                          </field.FormField>
                        )}
                      />

                      <form.AppField
                        name="unit"
                        children={(field) => (
                          <field.FormField>
                            <field.FormLabel>Unit</field.FormLabel>

                            {/* <InputWithStartIcon
                              type="text"
                              placeholder="kg"
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              className="ps-10"
                            >
                              per
                            </InputWithStartIcon> */}

                            <InputGroup>
                              <InputGroupInput
                                type="text"
                                placeholder="kg"
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) =>
                                  field.handleChange(e.target.value)
                                }
                              />
                              <InputGroupAddon>per</InputGroupAddon>
                            </InputGroup>

                            <field.FormError />

                            <field.FormDescription>
                              Example: kg, ltr, ml, etc.
                            </field.FormDescription>
                          </field.FormField>
                        )}
                      />

                      <form.AppField
                        name="salePrice"
                        children={(field) => (
                          <field.FormField className="col-span-full">
                            <field.FormLabel>Sale Price</field.FormLabel>

                            {/* <InputWithStartIcon
                              type="text"
                              placeholder="150"
                              value={field.state.value?.toString() ?? ""}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                            >
                              Rs.
                            </InputWithStartIcon> */}
                            <InputGroup>
                              <InputGroupInput
                                type="text"
                                placeholder="150"
                                value={field.state.value?.toString()}
                                onBlur={field.handleBlur}
                                onChange={(e) =>
                                  field.handleChange(parseInt(e.target.value))
                                }
                              />
                              <InputGroupAddon>Rs.</InputGroupAddon>
                            </InputGroup>

                            <field.FormError />

                            <field.FormDescription>
                              (Optional) Discounted price for the product.
                            </field.FormDescription>
                          </field.FormField>
                        )}
                      />
                    </div>

                    <form.AppField
                      name="description"
                      children={(field) => (
                        <field.FormField>
                          <field.FormLabel>Description</field.FormLabel>

                          <field.FormTextarea
                            rows={4}
                            placeholder="Freshly prepared organic..."
                          />

                          <field.FormError />
                        </field.FormField>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card className="overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-xl">Product Images</CardTitle>
                    <CardDescription>
                      Upload and manage images that represent this product in
                      your store.
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <form.AppField
                      name="images"
                      children={(field) => (
                        <field.FormField>
                          <FileUploader
                            maxFilesCount={20}
                            maxFileSize="1gb"
                            accept={["image/*"]}
                            onChange={(files) =>
                              field.handleChange(files.map((file) => file.id))
                            }
                            initialFiles={props.images}
                          >
                            <FileUpload />
                            <UploadingFilesList />
                            <UploadedFilesList />
                          </FileUploader>

                          <field.FormError />
                        </field.FormField>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Product Metadata</CardTitle>
                    <CardDescription>
                      Organize and control how the product appears in your
                      catalog.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="grid gap-6">
                    <form.AppField
                      name="status"
                      children={(field) => (
                        <field.FormField>
                          <field.FormLabel>Status</field.FormLabel>

                          <Select
                            value={field.state.value}
                            onValueChange={(value) =>
                              field.handleChange(
                                value as "draft" | "archived" | "published",
                              )
                            }
                          >
                            <field.FormSelectTrigger
                              aria-label="Select a status"
                              className="w-full"
                            >
                              <SelectValue placeholder="Select status">
                                {field.state.value === "draft"
                                  ? "Draft"
                                  : field.state.value === "archived"
                                    ? "Archived"
                                    : "Published"}
                              </SelectValue>
                            </field.FormSelectTrigger>

                            <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="archived">Archived</SelectItem>
                              <SelectItem value="published">
                                Published
                              </SelectItem>
                            </SelectContent>
                          </Select>

                          <field.FormError />
                        </field.FormField>
                      )}
                    />

                    <form.AppField
                      name="categoryId"
                      children={(field) => {
                        const selectedCategory =
                          field.state.value === null
                            ? "None"
                            : props.categories.find(
                                (category) => category.id === field.state.value,
                              )?.name;

                        return (
                          <field.FormField>
                            <field.FormLabel>Category</field.FormLabel>

                            <Select
                              value={
                                field.state.value === null
                                  ? "null"
                                  : String(field.state.value)
                              }
                              onValueChange={(value) =>
                                field.handleChange(
                                  value === "null" ? null : Number(value),
                                )
                              }
                            >
                              <field.FormSelectTrigger
                                aria-label="Select a category"
                                className="w-full"
                              >
                                <SelectValue placeholder="Select category">
                                  {selectedCategory}
                                </SelectValue>
                              </field.FormSelectTrigger>

                              <SelectContent>
                                <SelectItem value="null">None</SelectItem>

                                {props.categories.map((category) => (
                                  <SelectItem
                                    key={category.id}
                                    value={String(category.id)}
                                  >
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <field.FormError />
                          </field.FormField>
                        );
                      }}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="grid gap-2 xs:grid-cols-2 md:hidden">
              <ActionButtons isEditing={!!props.id} />
            </div>
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
        render={<Link to="/admin/products">Discard</Link>}
      />

      <Button size="sm" type="submit" disabled={isSubmitting}>
        {isSubmitting && <LoaderCircleIcon className="animate-spin" />}
        <span>{isEditing ? "Update" : "Add"} Product</span>
      </Button>
    </>
  );
}

function UploadingFilesList() {
  const { uploadingFiles, cancelUpload } = useFileUploader();

  if (uploadingFiles.length === 0) return null;

  return (
    <div className="mt-4">
      <p>Uploading files</p>

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
      <p>Uploaded files</p>

      <div className="mt-2 space-y-2">
        {uploadedFiles.map(({ name, url, fileType, id }) => (
          <FileList key={id} className="flex-grow">
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
