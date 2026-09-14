"""tests/integration/test_scrape_single_metadata_passthrough.py — scrape-single 不掛 metadata 白名單驗證（TASK-147c-T2）。

反向鎖：buildOrganizeMetadata() 送出整份 searchResults[i]（含 translated_title），
若日後把 _validate_metadata_shape() 掛回 scrape_single_endpoint，主力「整理」路徑會 400 全滅。
"""
from core.database.connection import init_db


class TestScrapeSingleMetadataPassthrough:
    def test_scrape_single_accepts_metadata_with_translated_title(
        self, client, tmp_path, monkeypatch, mocker
    ):
        # 成功路徑會呼叫 organize_failures.clear_on_success + try_inflow_upsert；
        # 隔離到 tmp DB，避免撞上 repo_write_guard（形狀同 test_scrape_single_clears_memory）。
        db_path = tmp_path / "test_scrape_passthrough.db"
        init_db(db_path)
        monkeypatch.setattr("core.database.connection.get_db_path", lambda: db_path)

        mocker.patch(
            "web.routers.scraper.organize_file",
            return_value={"success": True, "new_filename": "CAWD-500.mp4"},
        )
        mocker.patch("web.routers.scraper.try_inflow_upsert", return_value="not_linked")
        resp = client.post(
            "/api/scrape-single",
            json={
                "file_path": "/dummy/CAWD-500.mp4",
                "number": "CAWD-500",
                "metadata": {
                    "number": "CAWD-500",
                    "title": "Test Movie",
                    "translated_title": "測試片名",
                },
            },
        )
        assert resp.status_code == 200
