package smartbrew.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import smartbrew.dto.RawMaterialDTO;
import smartbrew.service.RawMaterialReceiptService;
import smartbrew.domain.ExcelGenerator;

import java.io.ByteArrayInputStream;
import java.util.List;

@RestController
@RequestMapping("/materials/receipt")
public class RawMaterialController {

    private final RawMaterialReceiptService rawMaterialReceiptService;
    private static final Logger logger = LoggerFactory.getLogger(RawMaterialReceiptController.class);

    @Autowired
    public RawMaterialController(RawMaterialReceiptService rawMaterialReceiptService) {
        this.rawMaterialReceiptService = rawMaterialReceiptService;
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

}
