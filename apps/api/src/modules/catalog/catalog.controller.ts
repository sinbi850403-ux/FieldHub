import { Controller, Get, Param } from "@nestjs/common";
import { Public } from "../auth/decorators/public.decorator";
import { CatalogService } from "./catalog.service";

@Controller()
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Public()
  @Get("/categories")
  listCategories() {
    return this.catalog.listCategories();
  }

  @Public()
  @Get("/categories/:id")
  getCategory(@Param("id") id: string) {
    return this.catalog.getCategory(id);
  }

  @Public()
  @Get("/categories/:id/jobs")
  listJobs(@Param("id") id: string) {
    return this.catalog.listJobs(id);
  }

  @Public()
  @Get("/categories/:id/input-fields")
  listInputFields(@Param("id") id: string) {
    return this.catalog.listInputFields(id);
  }
}
