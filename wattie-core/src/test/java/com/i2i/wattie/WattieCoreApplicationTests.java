package com.i2i.wattie;

import org.apache.ignite.client.IgniteClient;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest(properties = {
        "spring.sql.init.mode=never",
        "spring.autoconfigure.exclude=org.springframework.boot.jdbc.autoconfigure.DataSourceInitializationAutoConfiguration"
})
class WattieCoreApplicationTests {

    @MockitoBean
    private IgniteClient igniteClient;

    @Test
    void contextLoads() {
    }

}
