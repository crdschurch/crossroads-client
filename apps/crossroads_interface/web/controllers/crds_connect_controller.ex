defmodule CrossroadsInterface.CrdsConnectController do
  use CrossroadsInterface.Web, :controller
  require Logger
  require File

  @moduledoc"""
  This controller handles "/connect" (Finder) requests
  """

  plug CrossroadsInterface.Plug.BaseHref, "/connect"
  plug :put_layout, "crds_connect.html"

  

  def index(conn, _params) do
    render conn, "index.html", %{ "js_files": [
        "/js/crds_connect/polyfills.js",
        "/js/crds_connect/vendor.js",
        "/js/crds_connect/app.js"
      ], "base_href": "/connect"}
  end

end
