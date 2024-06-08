    package smartbrew.controller;

    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.core.io.InputStreamResource;
    import org.springframework.http.HttpHeaders;
    import org.springframework.http.HttpStatus;
    import org.springframework.http.MediaType;
    import org.springframework.http.ResponseEntity;
    import org.springframework.web.bind.annotation.*;
    import org.slf4j.Logger;
    import org.slf4j.LoggerFactory;
    import smartbrew.dto.MaterialReceiptreportDTO;
    import smartbrew.dto.MaterialreportDTO;
    import smartbrew.dto.RawMaterialDTO;
    import smartbrew.dto.RawMaterialReceiptDTO;
    import smartbrew.service.RawMaterialReceiptService;
    import smartbrew.service.RawMaterialService;
    import smartbrew.domain.ExcelGenerator;

    import java.io.ByteArrayInputStream;
    import java.util.List;

    @RestController
    @RequestMapping("/materials/receipt")
    public class RawMaterialController {

        private final RawMaterialReceiptService rawMaterialReceiptService;
        private final RawMaterialService rawMaterialService;
        private static final Logger logger = LoggerFactory.getLogger(RawMaterialController.class);

        @Autowired
        public RawMaterialController(RawMaterialReceiptService rawMaterialReceiptService, RawMaterialService rawMaterialService) {
            this.rawMaterialReceiptService = rawMaterialReceiptService;
            this.rawMaterialService = rawMaterialService;
        }

        @GetMapping("/info")
        public ResponseEntity<List<RawMaterialDTO>> getAllRawMaterialDTOs() {
            try {
                List<RawMaterialDTO> materials = rawMaterialReceiptService.getAllRawMaterialDTOs();
                return new ResponseEntity<>(materials, HttpStatus.OK);
            } catch (Exception e) {
                logger.error("재료 정보 가져오기 오류: ", e);
                return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }

        @GetMapping("/info/excel")
        public ResponseEntity<InputStreamResource> getAllRawMaterialDTOsAsExcel() {
            try {
                List<RawMaterialDTO> materials = rawMaterialReceiptService.getAllRawMaterialDTOs();
                ByteArrayInputStream in = ExcelGenerator.rawMaterialsToExcel(materials);

                HttpHeaders headers = new HttpHeaders();
                headers.add("Content-Disposition", "attachment; filename=raw_materials.xlsx");

                return ResponseEntity.ok()
                        .headers(headers)
                        .contentType(MediaType.APPLICATION_OCTET_STREAM)
                        .body(new InputStreamResource(in));
            } catch (Exception e) {
                logger.error("엑셀 파일 생성 오류: ", e);
                return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }

        @PostMapping("/add")
        public ResponseEntity<Void> addRawMaterialAndReceipt(@RequestBody MaterialreportDTO rawMaterialDTO, @RequestBody MaterialReceiptreportDTO receiptDTO) {
            try {
                rawMaterialService.addRawMaterialAndReceipt(rawMaterialDTO, receiptDTO);
                return new ResponseEntity<>(HttpStatus.CREATED);
            } catch (Exception e) {
                logger.error("Error adding raw material and receipt: ", e);
                return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }
